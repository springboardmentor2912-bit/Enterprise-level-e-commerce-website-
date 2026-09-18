package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final WarehouseOrderAllocationRepository warehouseOrderAllocationRepository;
    private final StockMovementLogRepository stockMovementLogRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final ReturnService returnService;
    private final PasswordEncoder passwordEncoder;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository,
                                WarehouseInventoryRepository warehouseInventoryRepository,
                                WarehouseOrderAllocationRepository warehouseOrderAllocationRepository,
                                StockMovementLogRepository stockMovementLogRepository,
                                OrderRepository orderRepository,
                                ProductRepository productRepository,
                                CustomerRepository customerRepository,
                                ReturnRequestRepository returnRequestRepository,
                                ReturnService returnService,
                                PasswordEncoder passwordEncoder,
                                InventoryHistoryRepository inventoryHistoryRepository) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseInventoryRepository = warehouseInventoryRepository;
        this.warehouseOrderAllocationRepository = warehouseOrderAllocationRepository;
        this.stockMovementLogRepository = stockMovementLogRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.returnService = returnService;
        this.passwordEncoder = passwordEncoder;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
    }

    // ─── Warehouse CRUD ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public WarehouseDTO createWarehouse(CreateWarehouseRequest request) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Warehouse code is required.");
        }
        if (warehouseRepository.findByCode(request.getCode().trim().toUpperCase()).isPresent()) {
            throw new IllegalArgumentException("Warehouse with code '" + request.getCode() + "' already exists.");
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode().trim().toUpperCase());
        warehouse.setLocation(request.getLocation());
        warehouse.setContact(request.getContact());
        warehouse.setStatus(request.getStatus() != null ? request.getStatus() : WarehouseStatus.ACTIVE);

        Warehouse saved = warehouseRepository.save(warehouse);
        return new WarehouseDTO(saved);
    }

    @Override
    @Transactional
    public WarehouseDTO updateWarehouse(Long id, CreateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        if (request.getName() != null) warehouse.setName(request.getName());
        if (request.getLocation() != null) warehouse.setLocation(request.getLocation());
        if (request.getContact() != null) warehouse.setContact(request.getContact());
        if (request.getStatus() != null) warehouse.setStatus(request.getStatus());

        return new WarehouseDTO(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional
    public WarehouseDTO toggleWarehouseStatus(Long id, Boolean active) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        warehouse.setStatus(Boolean.TRUE.equals(active) ? WarehouseStatus.ACTIVE : WarehouseStatus.INACTIVE);
        return new WarehouseDTO(warehouseRepository.save(warehouse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(WarehouseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        return new WarehouseDTO(warehouse);
    }

    // ─── Inventory ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseInventoryDTO> getWarehouseInventory(Long warehouseId) {
        return warehouseInventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(WarehouseInventoryDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseInventoryDTO> getAllWarehouseInventory() {
        return warehouseInventoryRepository.findAll().stream()
                .map(WarehouseInventoryDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseInventoryDTO addOrUpdateInventoryStock(Long warehouseId, UpdateWarehouseStockRequest request) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        if (WarehouseStatus.INACTIVE.equals(warehouse.getStatus())) {
            throw new IllegalStateException("Cannot update stock for an INACTIVE warehouse.");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        WarehouseInventory inventory = warehouseInventoryRepository
                .findByWarehouseIdAndProductId(warehouseId, product.getId())
                .orElseGet(() -> new WarehouseInventory(warehouse, product, 0, 0));

        int qtyToAdd = request.getQuantity() != null ? request.getQuantity() : 0;
        if (inventory.getAvailableQuantity() + qtyToAdd < 0) {
            throw new IllegalArgumentException("Available quantity cannot become negative.");
        }

        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + qtyToAdd);
        WarehouseInventory savedInventory = warehouseInventoryRepository.save(inventory);

        // Sync global product stock
        int totalAvail = warehouseInventoryRepository.findByProductId(product.getId())
                .stream().mapToInt(WarehouseInventory::getAvailableQuantity).sum();
        product.setStockQuantity(totalAvail);
        productRepository.save(product);

        // Record AVAILABLE stock movement
        StockMovementLog log = new StockMovementLog(
                product, warehouse, null,
                "NONE", "AVAILABLE",
                StockMovementStage.AVAILABLE,
                qtyToAdd,
                request.getNotes() != null && !request.getNotes().isBlank() ? request.getNotes() : "Stock quantity adjustment"
        );
        stockMovementLogRepository.save(log);

        return new WarehouseInventoryDTO(savedInventory);
    }

    // ─── Order Allocation (Admin Only) ─────────────────────────────────────────

    @Override
    @Transactional
    public List<WarehouseOrderAllocationDTO> allocateOrder(AllocateOrderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // Only CONFIRMED orders can be allocated
        if (!OrderStatus.CONFIRMED.equals(order.getStatus())) {
            throw new IllegalStateException(
                "Only CONFIRMED orders can be allocated. Current status: " + order.getStatus());
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));

        if (WarehouseStatus.INACTIVE.equals(warehouse.getStatus())) {
            throw new IllegalStateException("Cannot allocate from an INACTIVE warehouse: " + warehouse.getName());
        }

        // Prevent duplicate allocation
        List<WarehouseOrderAllocation> existing = warehouseOrderAllocationRepository.findByOrderId(order.getId());
        if (!existing.isEmpty()) {
            throw new IllegalStateException("Order #" + order.getId() + " has already been allocated to warehouse '" + existing.get(0).getWarehouse().getName() + "'. Duplicate allocation prevented.");
        }

        // Verify stock availability for all items
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByWarehouseIdAndProductId(warehouse.getId(), product.getId())
                    .orElseThrow(() -> new IllegalStateException(
                        "Warehouse '" + warehouse.getName() + "' has no stock record for product '" + product.getName() + "'. Allocation prevented."));

            if (inventory.getAvailableQuantity() < item.getQuantity()) {
                throw new IllegalStateException(
                    "Insufficient available stock in warehouse '" + warehouse.getName() +
                    "' for product '" + product.getName() + "'. Requested: " + item.getQuantity() +
                    ", Available: " + inventory.getAvailableQuantity());
            }
        }

        // Execute allocation — reserve stock
        List<WarehouseOrderAllocation> createdAllocations = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByWarehouseIdAndProductId(warehouse.getId(), product.getId()).get();

            // Deduct from available, add to allocated
            inventory.setAvailableQuantity(inventory.getAvailableQuantity() - item.getQuantity());
            inventory.setAllocatedQuantity(inventory.getAllocatedQuantity() + item.getQuantity());
            warehouseInventoryRepository.save(inventory);

            // Sync global product stock
            int totalAvail = warehouseInventoryRepository.findByProductId(product.getId())
                    .stream().mapToInt(WarehouseInventory::getAvailableQuantity).sum();
            product.setStockQuantity(totalAvail);
            productRepository.save(product);

            WarehouseOrderAllocation allocation = new WarehouseOrderAllocation(
                    order, item, warehouse, product, item.getQuantity(), WarehouseAllocationStatus.ALLOCATED);
            WarehouseOrderAllocation savedAllocation = warehouseOrderAllocationRepository.save(allocation);
            createdAllocations.add(savedAllocation);

            // Record ALLOCATED stock movement
            StockMovementLog log = new StockMovementLog(
                    product, warehouse, order,
                    "AVAILABLE", "ALLOCATED",
                    StockMovementStage.ALLOCATED,
                    item.getQuantity(),
                    "Allocated stock for Order #" + order.getId() + " to " + warehouse.getName());
            stockMovementLogRepository.save(log);
        }

        // Transition order status: CONFIRMED → WAREHOUSE_ALLOCATED & store target warehouse_id
        order.setWarehouse(warehouse);
        order.setStatus(OrderStatus.WAREHOUSE_ALLOCATED);
        orderRepository.save(order);

        return createdAllocations.stream().map(WarehouseOrderAllocationDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<WarehouseOrderAllocationDTO> autoAllocateOrderIfPossible(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Check if already allocated
        List<WarehouseOrderAllocation> existing = warehouseOrderAllocationRepository.findByOrderId(order.getId());
        if (!existing.isEmpty()) {
            return existing.stream().map(WarehouseOrderAllocationDTO::new).collect(Collectors.toList());
        }

        if (!OrderStatus.CONFIRMED.equals(order.getStatus())) {
            throw new IllegalStateException("Only CONFIRMED orders can be auto-allocated. Current status: " + order.getStatus());
        }

        List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
        if (activeWarehouses.isEmpty()) {
            return new ArrayList<>();
        }

        // Find first active warehouse with sufficient stock for ALL items
        for (Warehouse wh : activeWarehouses) {
            boolean fitsAll = true;
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = warehouseInventoryRepository
                        .findByWarehouseIdAndProductId(wh.getId(), item.getProduct().getId());
                if (invOpt.isEmpty() || invOpt.get().getAvailableQuantity() < item.getQuantity()) {
                    fitsAll = false;
                    break;
                }
            }
            if (fitsAll) {
                return allocateOrder(new AllocateOrderRequest(orderId, wh.getId()));
            }
        }

        return new ArrayList<>();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseDTO> getSuitableWarehousesForOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        List<Warehouse> activeWarehouses = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
        List<WarehouseDTO> suitable = new ArrayList<>();

        for (Warehouse wh : activeWarehouses) {
            boolean hasSufficientStock = true;
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = warehouseInventoryRepository
                        .findByWarehouseIdAndProductId(wh.getId(), item.getProduct().getId());
                if (invOpt.isEmpty() || invOpt.get().getAvailableQuantity() < item.getQuantity()) {
                    hasSufficientStock = false;
                    break;
                }
            }
            if (hasSufficientStock) {
                suitable.add(new WarehouseDTO(wh));
            }
        }
        return suitable;
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseOrderAllocationDTO> getAllAllocations() {
        return warehouseOrderAllocationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(WarehouseOrderAllocationDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseOrderAllocationDTO> getAllocationsByWarehouse(Long warehouseId) {
        return warehouseOrderAllocationRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId).stream()
                .map(WarehouseOrderAllocationDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getStaffOrders(Long warehouseId) {
        if (warehouseId == null) {
            return new ArrayList<>();
        }
        return orderRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId).stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getUnallocatedOrders() {
        // Only CONFIRMED orders are eligible for allocation
        List<Order> confirmedOrders = orderRepository.findAll().stream()
                .filter(o -> OrderStatus.CONFIRMED.equals(o.getStatus()))
                .collect(Collectors.toList());

        List<OrderDTO> result = new ArrayList<>();
        for (Order order : confirmedOrders) {
            List<WarehouseOrderAllocation> allocations = warehouseOrderAllocationRepository.findByOrderId(order.getId());
            if (allocations.isEmpty()) {
                result.add(new OrderDTO(order));
            }
        }
        return result;
    }

    // ─── Staff Workflow: Pick → Pack → Ready for Shipment ─────────────────────

    @Override
    @Transactional
    public WarehouseOrderAllocationDTO pickAllocation(Long allocationId, Long staffWarehouseId) {
        WarehouseOrderAllocation allocation = warehouseOrderAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Order allocation not found with ID: " + allocationId));

        // Enforce warehouse boundary
        if (staffWarehouseId != null && !staffWarehouseId.equals(allocation.getWarehouse().getId())) {
            throw new IllegalStateException("Access denied: This allocation belongs to a different warehouse. You can only process allocations for your assigned warehouse.");
        }

        if (!WarehouseAllocationStatus.ALLOCATED.equals(allocation.getStatus())) {
            throw new IllegalStateException("Allocation can only be PICKED when in ALLOCATED state. Current state: " + allocation.getStatus());
        }

        allocation.setStatus(WarehouseAllocationStatus.PICKED);
        WarehouseOrderAllocation saved = warehouseOrderAllocationRepository.save(allocation);

        // Update order status to PROCESSING when first item is picked
        Order order = allocation.getOrder();
        if (OrderStatus.WAREHOUSE_ALLOCATED.equals(order.getStatus())) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);
        }

        StockMovementLog log = new StockMovementLog(
                allocation.getProduct(), allocation.getWarehouse(), order,
                "ALLOCATED", "PICKED",
                StockMovementStage.PICKED,
                allocation.getAllocatedQuantity(),
                "Picked item from shelf for Order #" + order.getId());
        stockMovementLogRepository.save(log);

        return new WarehouseOrderAllocationDTO(saved);
    }

    @Override
    @Transactional
    public WarehouseOrderAllocationDTO packAllocation(Long allocationId, Long staffWarehouseId) {
        WarehouseOrderAllocation allocation = warehouseOrderAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Order allocation not found with ID: " + allocationId));

        // Enforce warehouse boundary
        if (staffWarehouseId != null && !staffWarehouseId.equals(allocation.getWarehouse().getId())) {
            throw new IllegalStateException("Access denied: This allocation belongs to a different warehouse. You can only process allocations for your assigned warehouse.");
        }

        if (!WarehouseAllocationStatus.PICKED.equals(allocation.getStatus())) {
            throw new IllegalStateException("Allocation can only be PACKED when in PICKED state. Current state: " + allocation.getStatus());
        }

        allocation.setStatus(WarehouseAllocationStatus.PACKED);
        WarehouseOrderAllocation saved = warehouseOrderAllocationRepository.save(allocation);

        StockMovementLog log = new StockMovementLog(
                allocation.getProduct(), allocation.getWarehouse(), allocation.getOrder(),
                "PICKED", "PACKED",
                StockMovementStage.PACKED,
                allocation.getAllocatedQuantity(),
                "Packed item into shipment box for Order #" + allocation.getOrder().getId());
        stockMovementLogRepository.save(log);

        return new WarehouseOrderAllocationDTO(saved);
    }

    @Override
    @Transactional
    public WarehouseOrderAllocationDTO readyForShipmentAllocation(Long allocationId, Long staffWarehouseId) {
        WarehouseOrderAllocation allocation = warehouseOrderAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Order allocation not found with ID: " + allocationId));

        // Enforce warehouse boundary
        if (staffWarehouseId != null && !staffWarehouseId.equals(allocation.getWarehouse().getId())) {
            throw new IllegalStateException("Access denied: This allocation belongs to a different warehouse. You can only process allocations for your assigned warehouse.");
        }

        if (!WarehouseAllocationStatus.PACKED.equals(allocation.getStatus())) {
            throw new IllegalStateException("Allocation can only be marked READY_FOR_SHIPMENT when in PACKED state. Current state: " + allocation.getStatus());
        }

        allocation.setStatus(WarehouseAllocationStatus.READY_FOR_SHIPMENT);
        WarehouseOrderAllocation saved = warehouseOrderAllocationRepository.save(allocation);

        // Deduct from allocatedQuantity in WarehouseInventory (item leaves warehouse)
        WarehouseInventory inventory = warehouseInventoryRepository
                .findByWarehouseIdAndProductId(allocation.getWarehouse().getId(), allocation.getProduct().getId())
                .orElse(null);

        if (inventory != null) {
            int newAllocated = Math.max(0, inventory.getAllocatedQuantity() - allocation.getAllocatedQuantity());
            inventory.setAllocatedQuantity(newAllocated);
            warehouseInventoryRepository.save(inventory);
        }

        StockMovementLog log = new StockMovementLog(
                allocation.getProduct(), allocation.getWarehouse(), allocation.getOrder(),
                "PACKED", "READY_FOR_SHIPMENT",
                StockMovementStage.READY_FOR_SHIPMENT,
                allocation.getAllocatedQuantity(),
                "Prepared shipment label and staging for Order #" + allocation.getOrder().getId());
        stockMovementLogRepository.save(log);

        // If ALL allocations for this order are READY_FOR_SHIPMENT, mark order as READY_FOR_SHIPPING
        Order order = allocation.getOrder();
        List<WarehouseOrderAllocation> allAllocationsForOrder = warehouseOrderAllocationRepository.findByOrderId(order.getId());
        boolean allReady = allAllocationsForOrder.stream()
                .allMatch(a -> WarehouseAllocationStatus.READY_FOR_SHIPMENT.equals(a.getStatus()));

        if (allReady) {
            order.setStatus(OrderStatus.READY_FOR_SHIPPING);
            orderRepository.save(order);
        }

        return new WarehouseOrderAllocationDTO(saved);
    }

    // ─── Stock Movement Logs ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementLogDTO> getStockMovementLogs() {
        return stockMovementLogRepository.findAllByOrderByTimestampDesc().stream()
                .map(StockMovementLogDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementLogDTO> getStockMovementLogsByWarehouse(Long warehouseId) {
        return stockMovementLogRepository.findAllByOrderByTimestampDesc().stream()
                .filter(log -> log.getWarehouse() != null && warehouseId.equals(log.getWarehouse().getId()))
                .map(StockMovementLogDTO::new)
                .collect(Collectors.toList());
    }

    // ─── Analytics ─────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public WarehouseAnalyticsDTO getWarehouseAnalytics() {
        WarehouseAnalyticsDTO stats = new WarehouseAnalyticsDTO();

        List<Warehouse> warehouses = warehouseRepository.findAll();
        stats.setTotalWarehouses(warehouses.size());
        stats.setActiveWarehouses(warehouses.stream().filter(w -> WarehouseStatus.ACTIVE.equals(w.getStatus())).count());

        List<WarehouseInventory> inventories = warehouseInventoryRepository.findAll();
        stats.setTotalAvailableStock(inventories.stream().mapToLong(WarehouseInventory::getAvailableQuantity).sum());
        stats.setTotalAllocatedStock(inventories.stream().mapToLong(WarehouseInventory::getAllocatedQuantity).sum());

        List<WarehouseOrderAllocation> allocations = warehouseOrderAllocationRepository.findAll();
        stats.setPendingAllocationsCount(allocations.stream().filter(a -> WarehouseAllocationStatus.ALLOCATED.equals(a.getStatus())).count());
        stats.setPickedAllocationsCount(allocations.stream().filter(a -> WarehouseAllocationStatus.PICKED.equals(a.getStatus())).count());
        stats.setPackedAllocationsCount(allocations.stream().filter(a -> WarehouseAllocationStatus.PACKED.equals(a.getStatus())).count());
        stats.setReadyForShipmentCount(allocations.stream().filter(a -> WarehouseAllocationStatus.READY_FOR_SHIPMENT.equals(a.getStatus())).count());

        return stats;
    }

    // ─── Staff Management (Admin Only) ─────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<WarehouseStaffDTO> getWarehouseStaff() {
        return customerRepository.findByRole(Role.WAREHOUSE_STAFF).stream()
                .map(WarehouseStaffDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WarehouseStaffDTO createWarehouseStaff(CreateWarehouseStaffRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("An account with email '" + request.getEmail() + "' already exists.");
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));

        Customer staff = new Customer();
        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setPhone(request.getPhone());
        staff.setRole(Role.WAREHOUSE_STAFF);
        staff.setWarehouse(warehouse);

        Customer saved = customerRepository.save(staff);
        return new WarehouseStaffDTO(saved);
    }

    @Override
    @Transactional
    public WarehouseStaffDTO assignStaffToWarehouse(Long staffId, Long warehouseId) {
        Customer staff = customerRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with ID: " + staffId));

        if (!Role.WAREHOUSE_STAFF.equals(staff.getRole())) {
            throw new IllegalArgumentException("User with ID " + staffId + " is not a warehouse staff member.");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        staff.setWarehouse(warehouse);
        Customer saved = customerRepository.save(staff);
        return new WarehouseStaffDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public WarehouseStaffDTO getStaffProfile(String email) {
        Customer staff = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with email: " + email));
        return new WarehouseStaffDTO(staff);
    }

    // ─── Staff Return & QC Operations ────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ReturnRequestDTO> getStaffReturns(Long warehouseId) {
        List<ReturnRequest> allReturns = returnRequestRepository.findAllByOrderByCreatedAtDesc();
        return allReturns.stream()
                .filter(r -> ReturnStatus.RETURN_APPROVED.equals(r.getReturnStatus()) ||
                             ReturnStatus.PRODUCT_RETURNED.equals(r.getReturnStatus()) ||
                             ReturnStatus.RETURN_RECEIVED.equals(r.getReturnStatus()) ||
                             ReturnStatus.RETURN_ACCEPTED.equals(r.getReturnStatus()) ||
                             ReturnStatus.RETURN_REJECTED.equals(r.getReturnStatus()))
                .filter(r -> {
                    if (warehouseId == null) return true; // global staff / admin view
                    Warehouse assignedWarehouse = r.getOrder() != null ? r.getOrder().getWarehouse() : null;
                    if (assignedWarehouse == null && r.getOrder() != null) {
                        assignedWarehouse = warehouseOrderAllocationRepository.findByOrderId(r.getOrder().getId())
                                .stream().map(WarehouseOrderAllocation::getWarehouse).findFirst().orElse(null);
                    }
                    return assignedWarehouse != null && assignedWarehouse.getId().equals(warehouseId);
                })
                .map(ReturnRequestDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReturnRequestDTO processStaffQC(Long returnId, String staffEmail, WarehouseQCRequestDto request) {
        Customer staff = customerRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found with email: " + staffEmail));

        // Enforce role check: Admin cannot perform QC
        if (!Role.WAREHOUSE_STAFF.equals(staff.getRole())) {
            throw new IllegalStateException("Admin is not permitted to perform Quality Control (QC). Quality Control must be performed by assigned Warehouse Staff.");
        }

        Warehouse staffWarehouse = staff.getWarehouse();
        if (staffWarehouse == null) {
            throw new IllegalStateException("You are not assigned to any warehouse. QC can only be performed by warehouse staff.");
        }

        ReturnRequest r = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with ID: " + returnId));

        if (!ReturnStatus.RETURN_APPROVED.equals(r.getReturnStatus()) &&
            !ReturnStatus.PRODUCT_RETURNED.equals(r.getReturnStatus()) &&
            !ReturnStatus.RETURN_RECEIVED.equals(r.getReturnStatus())) {
            throw new IllegalStateException("Only approved or returned requests can undergo Quality Control (QC). Current status: " + r.getReturnStatus());
        }

        Order order = r.getOrder();
        Warehouse assignedWarehouse = order != null ? order.getWarehouse() : null;
        if (assignedWarehouse == null && order != null) {
            assignedWarehouse = warehouseOrderAllocationRepository.findByOrderId(order.getId())
                    .stream().map(WarehouseOrderAllocation::getWarehouse).findFirst().orElse(null);
            if (assignedWarehouse != null) {
                order.setWarehouse(assignedWarehouse);
                orderRepository.save(order);
            }
        }

        // Enforce warehouse routing boundary: Only staff of the assigned warehouse can perform QC
        if (assignedWarehouse != null && !assignedWarehouse.getId().equals(staffWarehouse.getId())) {
            throw new IllegalStateException("Access denied: Return #" + returnId + " is assigned to warehouse '" +
                    assignedWarehouse.getName() + "' and cannot be received or QC'd at your warehouse ('" + staffWarehouse.getName() + "').");
        }

        Product product = r.getOrderItem().getProduct();
        int returnQty = r.getQuantity();
        QCResult qcResult = request.getQcResult();

        if (qcResult == null) {
            throw new IllegalArgumentException("QC Result is required (PASSED, DAMAGED, or FAILED).");
        }

        // Record QC audit metadata
        r.setQcResult(qcResult);
        r.setQcStaff(staff);
        r.setQcDate(java.time.LocalDateTime.now());
        r.setDamageDescription(request.getDamageDescription());
        r.setRestockWarehouse(staffWarehouse);

        if (QCResult.PASSED.equals(qcResult)) {
            // PASSED: product in good condition -> restock into available stock
            r.setIsUsable(true);
            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByWarehouseIdAndProductId(staffWarehouse.getId(), product.getId())
                    .orElseGet(() -> new WarehouseInventory(staffWarehouse, product, 0, 0));

            inventory.setAvailableQuantity(inventory.getAvailableQuantity() + returnQty);
            warehouseInventoryRepository.save(inventory);

            // Sync global product stock
            int totalAvail = warehouseInventoryRepository.findByProductId(product.getId())
                    .stream().mapToInt(WarehouseInventory::getAvailableQuantity).sum();
            product.setStockQuantity(totalAvail);
            productRepository.save(product);

            // Audit logs
            InventoryHistory history = new InventoryHistory(product, returnQty, totalAvail, "RETURN_RESTOCK");
            inventoryHistoryRepository.save(history);

            StockMovementLog log = new StockMovementLog(
                    product, staffWarehouse, order,
                    "RETURNED_USABLE", "AVAILABLE",
                    StockMovementStage.RETURNED_USABLE,
                    returnQty,
                    "QC PASSED: Product restocked for Return #" + returnId + " by " + staff.getName());
            stockMovementLogRepository.save(log);

            r.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);

        } else if (QCResult.DAMAGED.equals(qcResult)) {
            // DAMAGED: record damage attributes & quarantine stock
            r.setIsUsable(false);
            DamageType dType = request.getDamageType() != null ? request.getDamageType() : DamageType.OTHER;
            DamageResponsibility dResp = request.getDamageResponsibility() != null ? request.getDamageResponsibility() : DamageResponsibility.UNKNOWN;

            r.setDamageType(dType);
            r.setDamageResponsibility(dResp);

            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByWarehouseIdAndProductId(staffWarehouse.getId(), product.getId())
                    .orElseGet(() -> new WarehouseInventory(staffWarehouse, product, 0, 0));
            inventory.setDamagedQuantity(inventory.getDamagedQuantity() + returnQty);
            warehouseInventoryRepository.save(inventory);

            StockMovementLog log = new StockMovementLog(
                    product, staffWarehouse, order,
                    "RETURNED_DAMAGED", "DAMAGED_QUARANTINE",
                    StockMovementStage.RETURNED_DAMAGED,
                    returnQty,
                    "QC DAMAGED (" + dType + ", Resp: " + dResp + "): Quarantined for Return #" + returnId + " by " + staff.getName());
            stockMovementLogRepository.save(log);

            // Refund policy decision based on responsibility
            if (DamageResponsibility.CUSTOMER.equals(dResp)) {
                // Damaged by customer: reject return & refund per policy
                r.setReturnStatus(ReturnStatus.RETURN_REJECTED);
                r.setAdminNotes("QC DAMAGED: Product damaged by customer. Return rejected per policy.");
                if (order != null) {
                    order.setStatus(OrderStatus.DELIVERED);
                    orderRepository.save(order);
                }
            } else {
                // Damaged before/during delivery (SELLER, COURIER, UNKNOWN): accept return for refund
                r.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);
                r.setAdminNotes("QC DAMAGED (" + dResp + "): Return accepted for refund per damage policy.");
            }

        } else if (QCResult.FAILED.equals(qcResult)) {
            // FAILED: Return conditions not satisfied -> reject return
            r.setIsUsable(false);
            r.setReturnStatus(ReturnStatus.RETURN_REJECTED);
            r.setAdminNotes("QC FAILED: Return conditions not met (" + (request.getDamageDescription() != null ? request.getDamageDescription() : "Failed inspection") + ").");
            if (order != null) {
                order.setStatus(OrderStatus.DELIVERED);
                orderRepository.save(order);
            }
        }

        return new ReturnRequestDTO(returnRequestRepository.save(r));
    }

    @Override
    @Transactional
    public ReturnRequestDTO processStaffQC(Long returnId, Long staffWarehouseId, AdminReceiveReturnRequest request) {
        WarehouseQCRequestDto qcDto = new WarehouseQCRequestDto();
        qcDto.setQcResult(Boolean.TRUE.equals(request.getIsUsable()) ? QCResult.PASSED : QCResult.DAMAGED);
        qcDto.setDamageDescription(request.getAdminNotes());
        qcDto.setDamageResponsibility(DamageResponsibility.UNKNOWN);

        ReturnRequest r = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new ResourceNotFoundException("Return request not found with ID: " + returnId));

        Warehouse assignedWarehouse = r.getOrder() != null ? r.getOrder().getWarehouse() : null;
        Long targetWhId = staffWarehouseId != null ? staffWarehouseId : (assignedWarehouse != null ? assignedWarehouse.getId() : null);

        if (targetWhId == null) {
            List<Warehouse> active = warehouseRepository.findByStatus(WarehouseStatus.ACTIVE);
            if (!active.isEmpty()) targetWhId = active.get(0).getId();
        }

        // Fallback for legacy requests finding first staff of target warehouse
        List<Customer> staffList = customerRepository.findByRole(Role.WAREHOUSE_STAFF);
        String staffEmail = null;
        for (Customer c : staffList) {
            if (c.getWarehouse() != null && targetWhId != null && c.getWarehouse().getId().equals(targetWhId)) {
                staffEmail = c.getEmail();
                break;
            }
        }
        if (staffEmail == null && !staffList.isEmpty()) {
            staffEmail = staffList.get(0).getEmail();
        }
        if (staffEmail == null) {
            throw new IllegalStateException("No warehouse staff available to perform QC.");
        }

        return processStaffQC(returnId, staffEmail, qcDto);
    }
}
