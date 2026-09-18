package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository inventoryRepository;
    private final OrderWarehouseAllocationRepository allocationRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    public WarehouseService(WarehouseRepository warehouseRepository,
                            WarehouseInventoryRepository inventoryRepository,
                            OrderWarehouseAllocationRepository allocationRepository,
                            StockMovementRepository stockMovementRepository,
                            ProductRepository productRepository,
                            OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            ReturnRequestRepository returnRequestRepository,
                            UserRepository userRepository,
                            PaymentRepository paymentRepository,
                            NotificationService notificationService) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.allocationRepository = allocationRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.notificationService = notificationService;
    }

    // ==========================================
    // 1. Warehouse Management CRUD
    // ==========================================

    public List<WarehouseDTO> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapToWarehouseDTO)
                .collect(Collectors.toList());
    }

    public WarehouseDTO getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));
        return mapToWarehouseDTO(warehouse);
    }

    @Transactional
    public WarehouseDTO createWarehouse(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode().trim().toUpperCase())) {
            throw new IllegalArgumentException("Warehouse with code '" + request.getCode() + "' already exists.");
        }

        Warehouse warehouse = Warehouse.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry() != null ? request.getCountry() : "India")
                .pincode(request.getPincode())
                .contactPhone(request.getContactPhone())
                .contactEmail(request.getContactEmail())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 50000)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToWarehouseDTO(saved);
    }

    @Transactional
    public WarehouseDTO updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));

        warehouse.setName(request.getName().trim());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        warehouse.setPincode(request.getPincode());
        warehouse.setContactPhone(request.getContactPhone());
        warehouse.setContactEmail(request.getContactEmail());
        if (request.getCapacity() != null) {
            warehouse.setCapacity(request.getCapacity());
        }
        if (request.getActive() != null) {
            warehouse.setActive(request.getActive());
        }

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToWarehouseDTO(saved);
    }

    @Transactional
    public WarehouseDTO toggleWarehouseStatus(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));
        warehouse.setActive(!Boolean.TRUE.equals(warehouse.getActive()));
        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToWarehouseDTO(saved);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));
        warehouseRepository.delete(warehouse);
    }

    // ==========================================
    // 2. Warehouse Inventory & Restock
    // ==========================================

    public List<WarehouseInventoryDTO> getInventoryByWarehouse(Long warehouseId) {
        return inventoryRepository.findByWarehouseId(warehouseId).stream()
                .map(this::mapToInventoryDTO)
                .collect(Collectors.toList());
    }

    public List<WarehouseInventoryDTO> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToInventoryDTO)
                .collect(Collectors.toList());
    }

    public List<WarehouseInventoryDTO> checkAvailability(Long productId, Integer quantity) {
        int reqQty = (quantity != null && quantity > 0) ? quantity : 1;
        return inventoryRepository.findAvailableWarehousesForProduct(productId, reqQty).stream()
                .map(this::mapToInventoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public WarehouseInventoryDTO restockProduct(Long warehouseId, RestockRequest request) {
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + warehouseId));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + request.getProductId()));

        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, product.getId())
                .orElseGet(() -> WarehouseInventory.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .totalStock(0)
                        .allocatedStock(0)
                        .availableStock(0)
                        .aisleLocation(request.getAisleLocation() != null ? request.getAisleLocation() : "General Bay A-1")
                        .minThreshold(10)
                        .build());

        int prevAvailable = inventory.getAvailableStock();
        int prevAllocated = inventory.getAllocatedStock();
        int prevTotal = inventory.getTotalStock();

        if (request.getAisleLocation() != null && !request.getAisleLocation().trim().isEmpty()) {
            inventory.setAisleLocation(request.getAisleLocation().trim());
        }

        inventory.restock(request.getQuantity());
        WarehouseInventory savedInventory = inventoryRepository.save(inventory);

        // Update overall Product catalog stock quantity
        int currentCatalogStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(currentCatalogStock + request.getQuantity());
        if (product.getStatus() == ProductStatus.OUT_OF_STOCK) {
            product.setStatus(ProductStatus.ACTIVE);
        }
        productRepository.save(product);

        // Log Stock Movement
        StockMovement movement = StockMovement.builder()
                .warehouse(warehouse)
                .product(product)
                .movementType(StockMovementType.INBOUND_RESTOCK)
                .stage(StockMovementStage.RESTOCKED)
                .quantity(request.getQuantity())
                .previousAvailableStock(prevAvailable)
                .newAvailableStock(savedInventory.getAvailableStock())
                .previousAllocatedStock(prevAllocated)
                .newAllocatedStock(savedInventory.getAllocatedStock())
                .previousTotalStock(prevTotal)
                .newTotalStock(savedInventory.getTotalStock())
                .referenceNumber("RESTOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .notes(request.getNotes() != null ? request.getNotes() : "Inbound stock replenishment")
                .performedBy(request.getPerformedBy() != null ? request.getPerformedBy() : "Warehouse Manager")
                .build();
        stockMovementRepository.save(movement);

        return mapToInventoryDTO(savedInventory);
    }

    // ==========================================
    // 3. Warehouse Selection & Stock Allocation
    // ==========================================

    @Transactional
    public List<OrderWarehouseAllocationDTO> allocateOrder(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return Collections.emptyList();
        }

        // Avoid re-allocating if allocations already exist
        List<OrderWarehouseAllocation> existingAllocations = allocationRepository.findByOrderId(order.getId());
        if (!existingAllocations.isEmpty()) {
            return existingAllocations.stream().map(this::mapToAllocationDTO).collect(Collectors.toList());
        }

        List<Warehouse> activeWarehouses = warehouseRepository.findByActiveTrue();
        if (activeWarehouses.isEmpty()) {
            throw new RuntimeException("No active warehouses found in the system to allocate order stock.");
        }

        // STEP 1: Single-Warehouse Consolidation Check
        // Check if there is any single warehouse that can fulfill ALL items in this order
        Warehouse preferredSingleWarehouse = null;
        for (Warehouse wh : activeWarehouses) {
            boolean canFulfillAll = true;
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(wh.getId(), item.getProduct().getId());
                if (invOpt.isEmpty() || invOpt.get().getAvailableStock() < item.getQuantity()) {
                    canFulfillAll = false;
                    break;
                }
            }
            if (canFulfillAll) {
                preferredSingleWarehouse = wh;
                break;
            }
        }

        List<OrderWarehouseAllocation> createdAllocations = new ArrayList<>();

        for (OrderItem item : order.getItems()) {
            Warehouse targetWarehouse;
            WarehouseInventory inventory;

            if (preferredSingleWarehouse != null) {
                targetWarehouse = preferredSingleWarehouse;
                inventory = inventoryRepository.findByWarehouseIdAndProductId(targetWarehouse.getId(), item.getProduct().getId()).get();
            } else {
                // Pick warehouse with highest available stock for this product
                List<WarehouseInventory> availableInventories = inventoryRepository.findAvailableWarehousesForProduct(item.getProduct().getId(), item.getQuantity());
                if (!availableInventories.isEmpty()) {
                    inventory = availableInventories.get(0);
                    targetWarehouse = inventory.getWarehouse();
                } else {
                    // Fallback to any inventory record or create allocation with warning
                    List<WarehouseInventory> anyInventories = inventoryRepository.findActiveWarehousesForProduct(item.getProduct().getId());
                    if (!anyInventories.isEmpty()) {
                        inventory = anyInventories.get(0);
                        targetWarehouse = inventory.getWarehouse();
                    } else {
                        targetWarehouse = activeWarehouses.get(0);
                        inventory = WarehouseInventory.builder()
                                .warehouse(targetWarehouse)
                                .product(item.getProduct())
                                .totalStock(item.getQuantity())
                                .allocatedStock(0)
                                .availableStock(item.getQuantity())
                                .aisleLocation("Aisle 1, Bay A")
                                .build();
                        inventory = inventoryRepository.save(inventory);
                    }
                }
            }

            int prevAvailable = inventory.getAvailableStock();
            int prevAllocated = inventory.getAllocatedStock();
            int prevTotal = inventory.getTotalStock();

            // Reserve / Allocate stock in the warehouse
            inventory.allocate(item.getQuantity());
            inventoryRepository.save(inventory);

            // Create OrderWarehouseAllocation record
            OrderWarehouseAllocation allocation = OrderWarehouseAllocation.builder()
                    .order(order)
                    .orderItem(item)
                    .warehouse(targetWarehouse)
                    .allocatedQuantity(item.getQuantity())
                    .stage(StockMovementStage.ALLOCATED)
                    .aisleLocation(inventory.getAisleLocation() != null ? inventory.getAisleLocation() : "Aisle 1, Shelf A")
                    .notes("Allocated to " + targetWarehouse.getName() + " (" + targetWarehouse.getCode() + ")")
                    .build();

            OrderWarehouseAllocation savedAllocation = allocationRepository.save(allocation);
            createdAllocations.add(savedAllocation);

            // Log Stock Movement Audit Record
            StockMovement movement = StockMovement.builder()
                    .warehouse(targetWarehouse)
                    .product(item.getProduct())
                    .order(order)
                    .orderItem(item)
                    .movementType(StockMovementType.ORDER_ALLOCATION)
                    .stage(StockMovementStage.ALLOCATED)
                    .quantity(item.getQuantity())
                    .previousAvailableStock(prevAvailable)
                    .newAvailableStock(inventory.getAvailableStock())
                    .previousAllocatedStock(prevAllocated)
                    .newAllocatedStock(inventory.getAllocatedStock())
                    .previousTotalStock(prevTotal)
                    .newTotalStock(inventory.getTotalStock())
                    .referenceNumber(order.getOrderNumber())
                    .notes("Stock allocated for order " + order.getOrderNumber() + " at " + targetWarehouse.getName())
                    .performedBy("System Auto-Allocation Engine")
                    .build();
            stockMovementRepository.save(movement);
        }

        return createdAllocations.stream().map(this::mapToAllocationDTO).collect(Collectors.toList());
    }

    @Transactional
    public void cancelOrderAllocations(Order order) {
        if (order == null || order.getId() == null) return;
        List<OrderWarehouseAllocation> allocations = allocationRepository.findByOrderId(order.getId());
        for (OrderWarehouseAllocation alloc : allocations) {
            StockMovementStage currentStage = alloc.getStage();
            if (currentStage == StockMovementStage.CANCELLED) {
                continue;
            }

            Warehouse warehouse = alloc.getWarehouse();
            Product product = alloc.getOrderItem() != null ? alloc.getOrderItem().getProduct() : null;
            if (warehouse != null && product != null) {
                Optional<WarehouseInventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(warehouse.getId(), product.getId());
                if (invOpt.isPresent()) {
                    WarehouseInventory inv = invOpt.get();
                    int prevAvail = inv.getAvailableStock();
                    int prevAlloc = inv.getAllocatedStock();
                    int prevTotal = inv.getTotalStock();

                    if (currentStage == StockMovementStage.ALLOCATED || currentStage == StockMovementStage.PICKED || currentStage == StockMovementStage.PACKED) {
                        inv.deallocate(alloc.getAllocatedQuantity());
                        inventoryRepository.save(inv);
                    } else if (currentStage == StockMovementStage.READY_FOR_SHIPMENT || currentStage == StockMovementStage.SHIPPED) {
                        inv.restock(alloc.getAllocatedQuantity());
                        inventoryRepository.save(inv);
                    }

                    StockMovement movement = StockMovement.builder()
                            .warehouse(warehouse)
                            .product(product)
                            .order(order)
                            .orderItem(alloc.getOrderItem())
                            .movementType(StockMovementType.ALLOCATION_RELEASED)
                            .stage(StockMovementStage.CANCELLED)
                            .quantity(alloc.getAllocatedQuantity())
                            .previousAvailableStock(prevAvail)
                            .newAvailableStock(inv.getAvailableStock())
                            .previousAllocatedStock(prevAlloc)
                            .newAllocatedStock(inv.getAllocatedStock())
                            .previousTotalStock(prevTotal)
                            .newTotalStock(inv.getTotalStock())
                            .referenceNumber("CNCL-" + order.getOrderNumber())
                            .notes("Stock allocation released due to order cancellation: " + order.getOrderNumber())
                            .performedBy("System Lifecycle Engine")
                            .build();
                    stockMovementRepository.save(movement);
                }
            }

            alloc.setStage(StockMovementStage.CANCELLED);
            alloc.setNotes((alloc.getNotes() != null ? alloc.getNotes() + " | " : "") + "Order Cancelled.");
            allocationRepository.save(alloc);
        }
    }

    @Transactional
    public OrderWarehouseAllocationDTO manualAllocateOrderItem(ManualAllocationRequest request) {
        OrderItem orderItem = orderItemRepository.findById(request.getOrderItemId())
                .orElseThrow(() -> new RuntimeException("OrderItem not found with ID: " + request.getOrderItemId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + request.getWarehouseId()));

        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(warehouse.getId(), orderItem.getProduct().getId())
                .orElseGet(() -> {
                    WarehouseInventory newInv = WarehouseInventory.builder()
                            .warehouse(warehouse)
                            .product(orderItem.getProduct())
                            .totalStock(orderItem.getQuantity())
                            .allocatedStock(0)
                            .availableStock(orderItem.getQuantity())
                            .aisleLocation("Aisle 1, Rack A")
                            .build();
                    return inventoryRepository.save(newInv);
                });

        int prevAvailable = inventory.getAvailableStock();
        int prevAllocated = inventory.getAllocatedStock();
        int prevTotal = inventory.getTotalStock();

        // Release old allocation if exists
        Optional<OrderWarehouseAllocation> existingAllocOpt = allocationRepository.findByOrderItemId(orderItem.getId());
        if (existingAllocOpt.isPresent()) {
            OrderWarehouseAllocation oldAlloc = existingAllocOpt.get();
            Optional<WarehouseInventory> oldInvOpt = inventoryRepository.findByWarehouseIdAndProductId(oldAlloc.getWarehouse().getId(), orderItem.getProduct().getId());
            if (oldInvOpt.isPresent()) {
                WarehouseInventory oldInv = oldInvOpt.get();
                oldInv.deallocate(oldAlloc.getAllocatedQuantity());
                inventoryRepository.save(oldInv);
            }
            allocationRepository.delete(oldAlloc);
        }

        inventory.allocate(orderItem.getQuantity());
        inventoryRepository.save(inventory);

        OrderWarehouseAllocation allocation = OrderWarehouseAllocation.builder()
                .order(orderItem.getOrder())
                .orderItem(orderItem)
                .warehouse(warehouse)
                .allocatedQuantity(orderItem.getQuantity())
                .stage(StockMovementStage.ALLOCATED)
                .aisleLocation(inventory.getAisleLocation())
                .notes(request.getNotes() != null ? request.getNotes() : "Manually allocated to " + warehouse.getName())
                .build();

        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        StockMovement movement = StockMovement.builder()
                .warehouse(warehouse)
                .product(orderItem.getProduct())
                .order(orderItem.getOrder())
                .orderItem(orderItem)
                .movementType(StockMovementType.ORDER_ALLOCATION)
                .stage(StockMovementStage.ALLOCATED)
                .quantity(orderItem.getQuantity())
                .previousAvailableStock(prevAvailable)
                .newAvailableStock(inventory.getAvailableStock())
                .previousAllocatedStock(prevAllocated)
                .newAllocatedStock(inventory.getAllocatedStock())
                .previousTotalStock(prevTotal)
                .newTotalStock(inventory.getTotalStock())
                .referenceNumber(orderItem.getOrder().getOrderNumber())
                .notes("Manual allocation by Warehouse Manager")
                .performedBy("Warehouse Manager")
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 4. Pick Operation
    // ==========================================

    @Transactional
    public OrderWarehouseAllocationDTO pickOrderItem(Long allocationId, PickRequest request) {
        OrderWarehouseAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with ID: " + allocationId));

        if (allocation.getStage() != StockMovementStage.ALLOCATED) {
            throw new IllegalStateException("Cannot pick item. Current stage is: " + allocation.getStage() + " (Expected: ALLOCATED)");
        }

        allocation.setStage(StockMovementStage.PICKED);
        allocation.setPickerName(request.getPickerName() != null ? request.getPickerName() : "Warehouse Associate");
        allocation.setPickedAt(LocalDateTime.now());
        if (request.getNotes() != null) {
            allocation.setPickerNotes(request.getNotes());
        }

        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        // Update Order status to PROCESSING if currently CONFIRMED
        Order order = allocation.getOrder();
        if (order.getStatus() == OrderStatus.CONFIRMED) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.save(order);
        }

        // Log Stock Movement
        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(allocation.getWarehouse().getId(), allocation.getOrderItem().getProduct().getId())
                .orElse(null);

        StockMovement movement = StockMovement.builder()
                .warehouse(allocation.getWarehouse())
                .product(allocation.getOrderItem().getProduct())
                .order(allocation.getOrder())
                .orderItem(allocation.getOrderItem())
                .movementType(StockMovementType.PICK_CONFIRMED)
                .stage(StockMovementStage.PICKED)
                .quantity(allocation.getAllocatedQuantity())
                .previousAvailableStock(inventory != null ? inventory.getAvailableStock() : 0)
                .newAvailableStock(inventory != null ? inventory.getAvailableStock() : 0)
                .previousAllocatedStock(inventory != null ? inventory.getAllocatedStock() : 0)
                .newAllocatedStock(inventory != null ? inventory.getAllocatedStock() : 0)
                .previousTotalStock(inventory != null ? inventory.getTotalStock() : 0)
                .newTotalStock(inventory != null ? inventory.getTotalStock() : 0)
                .referenceNumber(allocation.getOrder().getOrderNumber())
                .notes("Item picked from " + (allocation.getAisleLocation() != null ? allocation.getAisleLocation() : "Aisle") + " by " + allocation.getPickerName())
                .performedBy(allocation.getPickerName())
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 5. Pack Operation
    // ==========================================

    @Transactional
    public OrderWarehouseAllocationDTO packOrderItem(Long allocationId, PackRequest request) {
        OrderWarehouseAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with ID: " + allocationId));

        if (allocation.getStage() != StockMovementStage.PICKED) {
            throw new IllegalStateException("Cannot pack item. Current stage is: " + allocation.getStage() + " (Expected: PICKED)");
        }

        allocation.setStage(StockMovementStage.PACKED);
        allocation.setPackerName(request.getPackerName() != null ? request.getPackerName() : "Packaging Specialist");
        allocation.setPackedAt(LocalDateTime.now());
        allocation.setBoxType(request.getBoxType() != null ? request.getBoxType() : "Standard Box B2");
        allocation.setBoxDimension(request.getBoxDimension() != null ? request.getBoxDimension() : "25x20x15 cm");
        allocation.setPackageWeightKg(request.getPackageWeightKg() != null ? request.getPackageWeightKg() : 0.85);
        allocation.setPackingSlipNumber("PS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        if (request.getNotes() != null) {
            allocation.setNotes(request.getNotes());
        }

        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        // Log Stock Movement
        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(allocation.getWarehouse().getId(), allocation.getOrderItem().getProduct().getId())
                .orElse(null);

        StockMovement movement = StockMovement.builder()
                .warehouse(allocation.getWarehouse())
                .product(allocation.getOrderItem().getProduct())
                .order(allocation.getOrder())
                .orderItem(allocation.getOrderItem())
                .movementType(StockMovementType.PACK_VERIFIED)
                .stage(StockMovementStage.PACKED)
                .quantity(allocation.getAllocatedQuantity())
                .previousAvailableStock(inventory != null ? inventory.getAvailableStock() : 0)
                .newAvailableStock(inventory != null ? inventory.getAvailableStock() : 0)
                .previousAllocatedStock(inventory != null ? inventory.getAllocatedStock() : 0)
                .newAllocatedStock(inventory != null ? inventory.getAllocatedStock() : 0)
                .previousTotalStock(inventory != null ? inventory.getTotalStock() : 0)
                .newTotalStock(inventory != null ? inventory.getTotalStock() : 0)
                .referenceNumber(allocation.getOrder().getOrderNumber())
                .notes("Item verified & packed into " + allocation.getBoxType() + " (Slip: " + allocation.getPackingSlipNumber() + ") by " + allocation.getPackerName())
                .performedBy(allocation.getPackerName())
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 6. Shipment Preparation (Ready for Shipment)
    // ==========================================

    @Transactional
    public OrderWarehouseAllocationDTO prepareShipment(Long allocationId, ShipmentPreparationRequest request) {
        OrderWarehouseAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with ID: " + allocationId));

        if (allocation.getStage() != StockMovementStage.PACKED) {
            throw new IllegalStateException("Cannot prepare shipment. Current stage is: " + allocation.getStage() + " (Expected: PACKED)");
        }

        allocation.setStage(StockMovementStage.READY_FOR_SHIPMENT);
        allocation.setCarrier(request.getCarrier() != null ? request.getCarrier() : "BlueDart Express");
        String trackingNum = request.getTrackingNumber();
        if (trackingNum == null || trackingNum.trim().isEmpty()) {
            trackingNum = "TRK-" + (allocation.getCarrier().contains("FedEx") ? "FDX" : "BLD") + "-" + (100000 + new Random().nextInt(900000));
        }
        allocation.setTrackingNumber(trackingNum);
        allocation.setReadyForShipmentAt(LocalDateTime.now());
        if (request.getNotes() != null) {
            allocation.setNotes(request.getNotes());
        }

        // Deduct physical inventory upon marking Ready for Shipment / Dispatched
        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(allocation.getWarehouse().getId(), allocation.getOrderItem().getProduct().getId())
                .orElse(null);

        int prevAvailable = inventory != null ? inventory.getAvailableStock() : 0;
        int prevAllocated = inventory != null ? inventory.getAllocatedStock() : 0;
        int prevTotal = inventory != null ? inventory.getTotalStock() : 0;

        if (inventory != null) {
            inventory.completeDeduction(allocation.getAllocatedQuantity());
            inventoryRepository.save(inventory);
        }

        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        // Log Stock Movement
        StockMovement movement = StockMovement.builder()
                .warehouse(allocation.getWarehouse())
                .product(allocation.getOrderItem().getProduct())
                .order(allocation.getOrder())
                .orderItem(allocation.getOrderItem())
                .movementType(StockMovementType.SHIPMENT_PREPARED)
                .stage(StockMovementStage.READY_FOR_SHIPMENT)
                .quantity(allocation.getAllocatedQuantity())
                .previousAvailableStock(prevAvailable)
                .newAvailableStock(inventory != null ? inventory.getAvailableStock() : 0)
                .previousAllocatedStock(prevAllocated)
                .newAllocatedStock(inventory != null ? inventory.getAllocatedStock() : 0)
                .previousTotalStock(prevTotal)
                .newTotalStock(inventory != null ? inventory.getTotalStock() : 0)
                .referenceNumber(allocation.getTrackingNumber())
                .notes("Order prepared for shipment via " + allocation.getCarrier() + " (Tracking: " + allocation.getTrackingNumber() + ")")
                .performedBy("Shipping Dispatcher")
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 7. Dispatch / Shipped Operation
    // ==========================================

    @Transactional
    public OrderWarehouseAllocationDTO dispatchShipment(Long allocationId) {
        OrderWarehouseAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with ID: " + allocationId));

        if (allocation.getStage() != StockMovementStage.READY_FOR_SHIPMENT) {
            throw new IllegalStateException("Cannot dispatch item. Current stage is: " + allocation.getStage() + " (Expected: READY_FOR_SHIPMENT)");
        }

        allocation.setStage(StockMovementStage.SHIPPED);
        allocation.setDispatchedAt(LocalDateTime.now());
        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        // Check if all allocations for this order are SHIPPED; if so, update Order status
        Order order = allocation.getOrder();
        List<OrderWarehouseAllocation> allOrderAllocs = allocationRepository.findByOrderId(order.getId());
        boolean allShipped = allOrderAllocs.stream().allMatch(a -> a.getStage() == StockMovementStage.SHIPPED);
        if (allShipped) {
            order.setStatus(OrderStatus.SHIPPED);
            orderRepository.save(order);
        }

        // Automatic real-time notification trigger for Order Shipped
        try {
            notificationService.sendOrderShippedNotification(order, allocation.getCarrier(), allocation.getTrackingNumber());
        } catch (Exception e) {
            System.err.println("Failed to send shipment dispatch notification: " + e.getMessage());
        }

        // Log Stock Movement
        StockMovement movement = StockMovement.builder()
                .warehouse(allocation.getWarehouse())
                .product(allocation.getOrderItem().getProduct())
                .order(allocation.getOrder())
                .orderItem(allocation.getOrderItem())
                .movementType(StockMovementType.SHIPMENT_DISPATCH)
                .stage(StockMovementStage.SHIPPED)
                .quantity(allocation.getAllocatedQuantity())
                .referenceNumber(allocation.getTrackingNumber())
                .notes("Package handed over to carrier " + allocation.getCarrier() + " for final delivery.")
                .performedBy("Logistics Coordinator")
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 7b. Delivery / Customer Receipt Operation
    // ==========================================

    @Transactional
    public OrderWarehouseAllocationDTO deliverShipment(Long allocationId) {
        OrderWarehouseAllocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with ID: " + allocationId));

        if (allocation.getStage() != StockMovementStage.SHIPPED && allocation.getStage() != StockMovementStage.READY_FOR_SHIPMENT) {
            throw new IllegalStateException("Cannot deliver item. Current stage is: " + allocation.getStage() + " (Expected: SHIPPED or READY_FOR_SHIPMENT)");
        }

        allocation.setStage(StockMovementStage.DELIVERED);
        OrderWarehouseAllocation saved = allocationRepository.save(allocation);

        // Update Order status to DELIVERED and payment status to PAID
        Order order = allocation.getOrder();
        List<OrderWarehouseAllocation> allOrderAllocs = allocationRepository.findByOrderId(order.getId());
        boolean allDelivered = allOrderAllocs.stream().allMatch(a -> a.getStage() == StockMovementStage.DELIVERED);
        if (allDelivered) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setPaymentStatus(PaymentStatus.PAID);
            orderRepository.save(order);

            // Automatic real-time notification trigger for Order Delivered
            try {
                notificationService.sendOrderDeliveredNotification(order);
            } catch (Exception e) {
                System.err.println("Failed to send order delivery notification: " + e.getMessage());
            }
        }

        // Log Stock Movement
        StockMovement movement = StockMovement.builder()
                .warehouse(allocation.getWarehouse())
                .product(allocation.getOrderItem().getProduct())
                .order(allocation.getOrder())
                .orderItem(allocation.getOrderItem())
                .movementType(StockMovementType.SHIPMENT_DISPATCH)
                .stage(StockMovementStage.DELIVERED)
                .quantity(allocation.getAllocatedQuantity())
                .referenceNumber(allocation.getTrackingNumber() != null ? allocation.getTrackingNumber() : order.getOrderNumber())
                .notes("Package successfully delivered to customer address: " + order.getShippingAddress())
                .performedBy("Delivery Courier Partner")
                .build();
        stockMovementRepository.save(movement);

        return mapToAllocationDTO(saved);
    }

    // ==========================================
    // 8. Queries, Movement History & Analytics
    // ==========================================

    public List<OrderWarehouseAllocationDTO> getAllAllocations(Long warehouseId, StockMovementStage stage, Long orderId) {
        List<OrderWarehouseAllocation> list;
        if (warehouseId != null && stage != null) {
            list = allocationRepository.findByWarehouseIdAndStage(warehouseId, stage);
        } else if (warehouseId != null) {
            list = allocationRepository.findByWarehouseId(warehouseId);
        } else if (stage != null) {
            list = allocationRepository.findByStage(stage);
        } else if (orderId != null) {
            list = allocationRepository.findByOrderId(orderId);
        } else {
            list = allocationRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream().map(this::mapToAllocationDTO).collect(Collectors.toList());
    }

    public List<StockMovementDTO> getStockMovements(Long warehouseId, Long productId, Long orderId, StockMovementStage stage) {
        List<StockMovement> list;
        if (warehouseId != null) {
            list = stockMovementRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
        } else if (productId != null) {
            list = stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId);
        } else if (orderId != null) {
            list = stockMovementRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        } else if (stage != null) {
            list = stockMovementRepository.findByStageOrderByCreatedAtDesc(stage);
        } else {
            list = stockMovementRepository.findTop100ByOrderByCreatedAtDesc();
        }

        return list.stream().map(this::mapToMovementDTO).collect(Collectors.toList());
    }

    public WarehouseAnalyticsDTO getWarehouseAnalytics() {
        WarehouseAnalyticsDTO dto = new WarehouseAnalyticsDTO();

        List<Warehouse> warehouses = warehouseRepository.findAll();
        dto.setTotalWarehouses((long) warehouses.size());

        long totalCapacity = warehouses.stream().mapToLong(w -> w.getCapacity() != null ? w.getCapacity() : 0).sum();
        dto.setTotalStorageCapacity(totalCapacity);

        List<WarehouseInventory> allInventories = inventoryRepository.findAll();
        long totalStored = allInventories.stream().mapToLong(WarehouseInventory::getTotalStock).sum();
        long totalAllocated = allInventories.stream().mapToLong(WarehouseInventory::getAllocatedStock).sum();
        long totalAvailable = allInventories.stream().mapToLong(WarehouseInventory::getAvailableStock).sum();

        dto.setTotalStoredStock(totalStored);
        dto.setTotalAllocatedStock(totalAllocated);
        dto.setTotalAvailableStock(totalAvailable);

        if (totalCapacity > 0) {
            double util = ((double) totalStored / totalCapacity) * 100.0;
            dto.setOverallUtilizationPercentage(Math.round(util * 10.0) / 10.0);
        }

        dto.setAllocatedCount(allocationRepository.countByStage(StockMovementStage.ALLOCATED));
        dto.setPickedCount(allocationRepository.countByStage(StockMovementStage.PICKED));
        dto.setPackedCount(allocationRepository.countByStage(StockMovementStage.PACKED));
        dto.setReadyForShipmentCount(allocationRepository.countByStage(StockMovementStage.READY_FOR_SHIPMENT));
        dto.setShippedCount(allocationRepository.countByStage(StockMovementStage.SHIPPED));

        long totalDamaged = allInventories.stream().mapToLong(WarehouseInventory::getDamagedStock).sum();
        dto.setTotalDamagedStock(totalDamaged);

        long pendingReturns = returnRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING_REVIEW").size();
        long receivedReturns = returnRequestRepository.findByStatusOrderByCreatedAtDesc("RECEIVED_AT_WAREHOUSE").size();
        dto.setPendingReturnsCount(pendingReturns + receivedReturns);

        long completedReturns = returnRequestRepository.findByStatusOrderByCreatedAtDesc("QC_PASSED_RESTOCKED").size()
                + returnRequestRepository.findByStatusOrderByCreatedAtDesc("QC_FAILED_DAMAGED").size();
        dto.setCompletedReturnsCount(completedReturns);

        long lowStock = allInventories.stream().filter(i -> i.getAvailableStock() <= i.getMinThreshold()).count();
        dto.setLowStockItemCount(lowStock);

        dto.setTotalStockMovements((long) stockMovementRepository.count());

        Map<String, Long> stageCounts = new HashMap<>();
        for (StockMovementStage st : StockMovementStage.values()) {
            stageCounts.put(st.name(), allocationRepository.countByStage(st));
        }
        dto.setPipelineStageCounts(stageCounts);

        List<WarehouseDTO> summaries = warehouses.stream().map(this::mapToWarehouseDTO).collect(Collectors.toList());
        dto.setWarehouseSummaries(summaries);

        return dto;
    }

    // ==========================================
    // Mapping Helpers
    // ==========================================

    private WarehouseDTO mapToWarehouseDTO(Warehouse w) {
        WarehouseDTO dto = new WarehouseDTO();
        dto.setId(w.getId());
        dto.setCode(w.getCode());
        dto.setName(w.getName());
        dto.setAddress(w.getAddress());
        dto.setCity(w.getCity());
        dto.setState(w.getState());
        dto.setCountry(w.getCountry());
        dto.setPincode(w.getPincode());
        dto.setContactPhone(w.getContactPhone());
        dto.setContactEmail(w.getContactEmail());
        dto.setCapacity(w.getCapacity());
        dto.setActive(w.getActive());
        dto.setCreatedAt(w.getCreatedAt());
        dto.setUpdatedAt(w.getUpdatedAt());

        Long stored = inventoryRepository.sumTotalStockByWarehouseId(w.getId());
        Long allocated = inventoryRepository.sumAllocatedStockByWarehouseId(w.getId());
        Long available = inventoryRepository.sumAvailableStockByWarehouseId(w.getId());

        dto.setTotalStoredUnits(stored != null ? stored : 0L);
        dto.setTotalAllocatedUnits(allocated != null ? allocated : 0L);
        dto.setTotalAvailableUnits(available != null ? available : 0L);

        if (w.getCapacity() != null && w.getCapacity() > 0 && stored != null) {
            double util = ((double) stored / w.getCapacity()) * 100.0;
            dto.setUtilizationPercentage(Math.round(util * 10.0) / 10.0);
        } else {
            dto.setUtilizationPercentage(0.0);
        }

        List<WarehouseInventory> invs = inventoryRepository.findByWarehouseId(w.getId());
        dto.setDistinctProductCount(invs.size());

        return dto;
    }

    private WarehouseInventoryDTO mapToInventoryDTO(WarehouseInventory inv) {
        WarehouseInventoryDTO dto = new WarehouseInventoryDTO();
        dto.setId(inv.getId());
        dto.setWarehouseId(inv.getWarehouse().getId());
        dto.setWarehouseCode(inv.getWarehouse().getCode());
        dto.setWarehouseName(inv.getWarehouse().getName());
        dto.setWarehouseCity(inv.getWarehouse().getCity());
        dto.setProductId(inv.getProduct().getId());
        dto.setProductTitle(inv.getProduct().getTitle());
        dto.setProductSku(inv.getProduct().getSku());
        dto.setProductImageUrl(inv.getProduct().getImageUrl());
        dto.setProductCategory(inv.getProduct().getCategory() != null ? inv.getProduct().getCategory().getName() : "");
        dto.setProductPrice(inv.getProduct().getDiscountPrice() != null ? inv.getProduct().getDiscountPrice() : inv.getProduct().getPrice());
        dto.setVendorStoreName(inv.getProduct().getVendorProfile() != null ? inv.getProduct().getVendorProfile().getStoreName() : "");
        dto.setTotalStock(inv.getTotalStock());
        dto.setAllocatedStock(inv.getAllocatedStock());
        dto.setAvailableStock(inv.getAvailableStock());
        dto.setDamagedStock(inv.getDamagedStock());
        dto.setAisleLocation(inv.getAisleLocation());
        dto.setMinThreshold(inv.getMinThreshold());
        dto.setIsLowStock(inv.getAvailableStock() <= (inv.getMinThreshold() != null ? inv.getMinThreshold() : 10));
        dto.setLastRestockedAt(inv.getLastRestockedAt());
        dto.setUpdatedAt(inv.getUpdatedAt());
        return dto;
    }

    private OrderWarehouseAllocationDTO mapToAllocationDTO(OrderWarehouseAllocation alloc) {
        OrderWarehouseAllocationDTO dto = new OrderWarehouseAllocationDTO();
        dto.setId(alloc.getId());
        dto.setOrderId(alloc.getOrder().getId());
        dto.setOrderNumber(alloc.getOrder().getOrderNumber());
        dto.setOrderItemId(alloc.getOrderItem().getId());
        dto.setProductId(alloc.getOrderItem().getProduct().getId());
        dto.setProductTitle(alloc.getOrderItem().getProduct().getTitle());
        dto.setProductSku(alloc.getOrderItem().getProduct().getSku());
        dto.setProductImageUrl(alloc.getOrderItem().getProduct().getImageUrl());
        dto.setProductPrice(alloc.getOrderItem().getUnitPrice());
        dto.setVendorStoreName(alloc.getOrderItem().getProduct().getVendorProfile() != null ? alloc.getOrderItem().getProduct().getVendorProfile().getStoreName() : "");
        dto.setWarehouseId(alloc.getWarehouse().getId());
        dto.setWarehouseCode(alloc.getWarehouse().getCode());
        dto.setWarehouseName(alloc.getWarehouse().getName());
        dto.setWarehouseCity(alloc.getWarehouse().getCity());
        dto.setAllocatedQuantity(alloc.getAllocatedQuantity());
        dto.setStage(alloc.getStage());
        dto.setAisleLocation(alloc.getAisleLocation());
        dto.setPickerName(alloc.getPickerName());
        dto.setPickedAt(alloc.getPickedAt());
        dto.setPickerNotes(alloc.getPickerNotes());
        dto.setPackerName(alloc.getPackerName());
        dto.setPackedAt(alloc.getPackedAt());
        dto.setPackageWeightKg(alloc.getPackageWeightKg());
        dto.setBoxDimension(alloc.getBoxDimension());
        dto.setBoxType(alloc.getBoxType());
        dto.setPackingSlipNumber(alloc.getPackingSlipNumber());
        dto.setCarrier(alloc.getCarrier());
        dto.setTrackingNumber(alloc.getTrackingNumber());
        dto.setReadyForShipmentAt(alloc.getReadyForShipmentAt());
        dto.setDispatchedAt(alloc.getDispatchedAt());
        dto.setCustomerName(alloc.getOrder().getCustomer() != null ? alloc.getOrder().getCustomer().getFullName() : "Customer");
        dto.setShippingAddress(alloc.getOrder().getShippingAddress());
        dto.setNotes(alloc.getNotes());
        dto.setCreatedAt(alloc.getCreatedAt());
        dto.setUpdatedAt(alloc.getUpdatedAt());
        return dto;
    }

    private StockMovementDTO mapToMovementDTO(StockMovement m) {
        StockMovementDTO dto = new StockMovementDTO();
        dto.setId(m.getId());
        dto.setWarehouseId(m.getWarehouse().getId());
        dto.setWarehouseCode(m.getWarehouse().getCode());
        dto.setWarehouseName(m.getWarehouse().getName());
        dto.setProductId(m.getProduct().getId());
        dto.setProductTitle(m.getProduct().getTitle());
        dto.setProductSku(m.getProduct().getSku());
        dto.setProductImageUrl(m.getProduct().getImageUrl());
        if (m.getOrder() != null) {
            dto.setOrderId(m.getOrder().getId());
            dto.setOrderNumber(m.getOrder().getOrderNumber());
        }
        dto.setMovementType(m.getMovementType());
        dto.setStage(m.getStage());
        dto.setQuantity(m.getQuantity());
        dto.setPreviousAvailableStock(m.getPreviousAvailableStock());
        dto.setNewAvailableStock(m.getNewAvailableStock());
        dto.setPreviousAllocatedStock(m.getPreviousAllocatedStock());
        dto.setNewAllocatedStock(m.getNewAllocatedStock());
        dto.setPreviousTotalStock(m.getPreviousTotalStock());
        dto.setNewTotalStock(m.getNewTotalStock());
        dto.setReferenceNumber(m.getReferenceNumber());
        dto.setNotes(m.getNotes());
        dto.setPerformedBy(m.getPerformedBy());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }

    // ==========================================
    // 8. Customer Returns & QC Inspection Workflow
    // ==========================================

    @Transactional
    public ReturnResponseDto requestReturn(Long customerId, ReturnRequestDto request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + customerId));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + request.getOrderId()));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new IllegalArgumentException("You can only request returns for your own orders.");
        }

        List<OrderWarehouseAllocation> allocs = allocationRepository.findByOrderId(order.getId());
        OrderWarehouseAllocation targetAlloc = allocs.isEmpty() ? null : allocs.get(0);
        OrderItem targetItem = (targetAlloc != null) ? targetAlloc.getOrderItem() : (order.getItems().isEmpty() ? null : order.getItems().get(0));
        Warehouse targetWarehouse = (targetAlloc != null) ? targetAlloc.getWarehouse() : warehouseRepository.findAll().stream().findFirst().orElse(null);

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        orderRepository.save(order);

        if (targetAlloc != null) {
            targetAlloc.setStage(StockMovementStage.RETURN_REQUESTED);
            allocationRepository.save(targetAlloc);
        }

        ReturnRequest returnReq = ReturnRequest.builder()
                .order(order)
                .orderItem(targetItem)
                .customer(customer)
                .warehouse(targetWarehouse)
                .reason(request.getReason())
                .returnReasonType(request.getReturnReasonType() != null ? request.getReturnReasonType() : "DEFECTIVE")
                .customerComments(request.getCustomerComments())
                .status("PENDING_REVIEW")
                .refundAmount(order.getTotalAmount())
                .build();

        ReturnRequest saved = returnRequestRepository.save(returnReq);
        return mapToReturnResponseDTO(saved);
    }

    @Transactional
    public ReturnResponseDto reviewReturn(Long returnId, ReturnReviewDto reviewDto, Long adminId) {
        ReturnRequest returnReq = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Return request not found with ID: " + returnId));

        Order order = returnReq.getOrder();
        List<OrderWarehouseAllocation> allocs = allocationRepository.findByOrderId(order.getId());
        OrderWarehouseAllocation targetAlloc = allocs.isEmpty() ? null : allocs.get(0);

        if (Boolean.TRUE.equals(reviewDto.getApproved())) {
            returnReq.setStatus("APPROVED");
            returnReq.setAdminNotes(reviewDto.getAdminNotes() != null ? reviewDto.getAdminNotes() : "Return approved by Admin. Route to assigned fulfillment hub.");

            if (reviewDto.getTargetWarehouseId() != null) {
                Warehouse targetWh = warehouseRepository.findById(reviewDto.getTargetWarehouseId()).orElse(null);
                if (targetWh != null) returnReq.setWarehouse(targetWh);
            }

            order.setStatus(OrderStatus.RETURN_APPROVED);
            orderRepository.save(order);

            if (targetAlloc != null) {
                targetAlloc.setStage(StockMovementStage.RETURN_APPROVED);
                allocationRepository.save(targetAlloc);
            }
        } else {
            returnReq.setStatus("REJECTED");
            returnReq.setAdminNotes(reviewDto.getAdminNotes() != null ? reviewDto.getAdminNotes() : "Return request rejected by Admin.");

            order.setStatus(OrderStatus.RETURN_REJECTED);
            orderRepository.save(order);

            if (targetAlloc != null) {
                targetAlloc.setStage(StockMovementStage.RETURN_REJECTED);
                allocationRepository.save(targetAlloc);
            }
        }

        ReturnRequest saved = returnRequestRepository.save(returnReq);
        return mapToReturnResponseDTO(saved);
    }

    @Transactional
    public ReturnResponseDto receiveReturnAtWarehouse(Long returnId, String staffName) {
        ReturnRequest returnReq = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Return request not found with ID: " + returnId));

        returnReq.setStatus("RECEIVED_AT_WAREHOUSE");
        returnReq.setInspectedBy(staffName != null ? staffName : "Warehouse QC Specialist");

        Order order = returnReq.getOrder();
        order.setStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        List<OrderWarehouseAllocation> allocs = allocationRepository.findByOrderId(order.getId());
        if (!allocs.isEmpty()) {
            OrderWarehouseAllocation alloc = allocs.get(0);
            alloc.setStage(StockMovementStage.RETURN_RECEIVED_AT_WAREHOUSE);
            allocationRepository.save(alloc);
        }

        ReturnRequest saved = returnRequestRepository.save(returnReq);
        return mapToReturnResponseDTO(saved);
    }

    @Transactional
    public ReturnResponseDto performQcInspection(Long returnId, QcInspectionDto qcDto, Long staffId) {
        ReturnRequest returnReq = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Return request not found with ID: " + returnId));

        Warehouse warehouse = returnReq.getWarehouse();
        if (warehouse == null) {
            warehouse = warehouseRepository.findAll().stream().findFirst().orElseThrow(() -> new RuntimeException("No warehouse found."));
            returnReq.setWarehouse(warehouse);
        }

        Product product = (returnReq.getOrderItem() != null) ? returnReq.getOrderItem().getProduct() : null;
        if (product == null && returnReq.getOrder() != null && !returnReq.getOrder().getItems().isEmpty()) {
            product = returnReq.getOrder().getItems().get(0).getProduct();
        }

        int quantity = (returnReq.getOrderItem() != null && returnReq.getOrderItem().getQuantity() != null)
                ? returnReq.getOrderItem().getQuantity() : 1;

        WarehouseInventory inv = (product != null)
                ? inventoryRepository.findByWarehouseIdAndProductId(warehouse.getId(), product.getId()).orElse(null)
                : null;

        String inspector = (qcDto.getInspectedBy() != null && !qcDto.getInspectedBy().isBlank())
                ? qcDto.getInspectedBy() : "QC Specialist #" + (staffId != null ? staffId : 101);

        returnReq.setInspectedBy(inspector);
        returnReq.setInspectedAt(LocalDateTime.now());
        returnReq.setQcNotes(qcDto.getQcNotes() != null ? qcDto.getQcNotes() : "QC Inspection completed");

        Order order = returnReq.getOrder();
        List<OrderWarehouseAllocation> allocs = allocationRepository.findByOrderId(order.getId());
        OrderWarehouseAllocation targetAlloc = allocs.isEmpty() ? null : allocs.get(0);

        boolean isPassed = "PASS".equalsIgnoreCase(qcDto.getQcDecision()) || "RESTOCK".equalsIgnoreCase(qcDto.getQcDecision());

        if (isPassed) {
            // ACCEPTED & RESTOCKED
            returnReq.setStatus("QC_PASSED_RESTOCKED");
            returnReq.setQcDecision("PASS");

            if (inv != null) {
                inv.setTotalStock(inv.getTotalStock() + quantity);
                inv.setAvailableStock(inv.getAvailableStock() + quantity);
                inventoryRepository.save(inv);
            }

            if (product != null) {
                int currentProdStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                product.setStockQuantity(currentProdStock + quantity);
                productRepository.save(product);
            }

            if (targetAlloc != null) {
                targetAlloc.setStage(StockMovementStage.QC_ACCEPTED_RESTOCKED);
                allocationRepository.save(targetAlloc);
            }

            order.setStatus(OrderStatus.REFUNDED);
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            orderRepository.save(order);

            // Synchronize Payment entity
            try {
                paymentRepository.findAll().stream()
                        .filter(p -> p.getOrderIdsJson() != null && p.getOrderIdsJson().contains(String.valueOf(order.getId())))
                        .forEach(p -> {
                            p.setStatus(PaymentStatus.REFUNDED);
                            paymentRepository.save(p);
                        });
            } catch (Exception ignored) {}

            // Log Stock Movement
            if (product != null) {
                StockMovement movement = StockMovement.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .order(order)
                        .movementType(StockMovementType.QC_RESTOCKED)
                        .stage(StockMovementStage.QC_ACCEPTED_RESTOCKED)
                        .quantity(quantity)
                        .previousAvailableStock(inv != null ? inv.getAvailableStock() - quantity : 0)
                        .newAvailableStock(inv != null ? inv.getAvailableStock() : quantity)
                        .previousAllocatedStock(inv != null ? inv.getAllocatedStock() : 0)
                        .newAllocatedStock(inv != null ? inv.getAllocatedStock() : 0)
                        .previousTotalStock(inv != null ? inv.getTotalStock() - quantity : 0)
                        .newTotalStock(inv != null ? inv.getTotalStock() : quantity)
                        .referenceNumber("QC-PASS-" + returnReq.getId())
                        .notes("QC Passed: Item verified intact, restocked to " + (inv != null ? inv.getAisleLocation() : "shelf") + ". Refund initiated.")
                        .performedBy(inspector)
                        .build();
                stockMovementRepository.save(movement);
            }
        } else {
            // FAILED & MOVED TO QUARANTINE / DAMAGED STOCK
            returnReq.setStatus("QC_FAILED_DAMAGED");
            returnReq.setQcDecision("FAIL");

            if (inv != null) {
                inv.moveToDamagedStock(quantity);
                inventoryRepository.save(inv);
            }

            if (targetAlloc != null) {
                targetAlloc.setStage(StockMovementStage.QC_REJECTED_DAMAGED);
                allocationRepository.save(targetAlloc);
            }

            order.setStatus(OrderStatus.REFUNDED);
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            orderRepository.save(order);

            // Synchronize Payment entity
            try {
                paymentRepository.findAll().stream()
                        .filter(p -> p.getOrderIdsJson() != null && p.getOrderIdsJson().contains(String.valueOf(order.getId())))
                        .forEach(p -> {
                            p.setStatus(PaymentStatus.REFUNDED);
                            paymentRepository.save(p);
                        });
            } catch (Exception ignored) {}

            // Log Stock Movement
            if (product != null) {
                StockMovement movement = StockMovement.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .order(order)
                        .movementType(StockMovementType.QC_QUARANTINED)
                        .stage(StockMovementStage.QC_REJECTED_DAMAGED)
                        .quantity(quantity)
                        .previousAvailableStock(inv != null ? inv.getAvailableStock() : 0)
                        .newAvailableStock(inv != null ? inv.getAvailableStock() : 0)
                        .previousAllocatedStock(inv != null ? inv.getAllocatedStock() : 0)
                        .newAllocatedStock(inv != null ? inv.getAllocatedStock() : 0)
                        .previousTotalStock(inv != null ? inv.getTotalStock() : 0)
                        .newTotalStock(inv != null ? inv.getTotalStock() : 0)
                        .referenceNumber("QC-FAIL-" + returnReq.getId())
                        .notes("QC Failed: Item damaged/defective. Moved " + quantity + " units to Quarantine Damaged Stock. Refund processed.")
                        .performedBy(inspector)
                        .build();
                stockMovementRepository.save(movement);
            }
        }

        ReturnRequest saved = returnRequestRepository.save(returnReq);

        // Automatic real-time notification trigger for Refund Completed
        try {
            double refundAmt = (saved.getRefundAmount() != null && saved.getRefundAmount() > 0)
                    ? saved.getRefundAmount()
                    : (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
            notificationService.sendRefundCompletedNotification(order, refundAmt, saved.getQcNotes());
        } catch (Exception e) {
            System.err.println("Failed to send refund completed notification: " + e.getMessage());
        }

        return mapToReturnResponseDTO(saved);
    }

    @Transactional
    public WarehouseInventoryDTO transferVendorStockToWarehouse(VendorStockTransferDto dto, Long vendorOrAdminId) {
        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + dto.getWarehouseId()));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + dto.getProductId()));

        WarehouseInventory inventory = inventoryRepository.findByWarehouseIdAndProductId(warehouse.getId(), product.getId())
                .orElseGet(() -> WarehouseInventory.builder()
                        .warehouse(warehouse)
                        .product(product)
                        .totalStock(0)
                        .allocatedStock(0)
                        .availableStock(0)
                        .damagedStock(0)
                        .aisleLocation(dto.getAisleLocation() != null ? dto.getAisleLocation() : "Aisle 01, Inbound Shelf")
                        .minThreshold(5)
                        .build());

        int prevAvailable = inventory.getAvailableStock();
        int prevTotal = inventory.getTotalStock();

        inventory.setTotalStock(prevTotal + dto.getQuantity());
        inventory.setAvailableStock(prevAvailable + dto.getQuantity());
        if (dto.getAisleLocation() != null && !dto.getAisleLocation().isBlank()) {
            inventory.setAisleLocation(dto.getAisleLocation());
        }
        inventory.setLastRestockedAt(LocalDateTime.now());
        WarehouseInventory savedInv = inventoryRepository.save(inventory);

        // Update product stock if applicable
        int curProdStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        product.setStockQuantity(Math.max(curProdStock, savedInv.getAvailableStock()));
        productRepository.save(product);

        // Log Stock Movement
        String sender = dto.getTransferredBy() != null ? dto.getTransferredBy() : "Vendor Dispatch";
        StockMovement movement = StockMovement.builder()
                .warehouse(warehouse)
                .product(product)
                .movementType(StockMovementType.VENDOR_STOCK_TRANSFER)
                .stage(StockMovementStage.AVAILABLE)
                .quantity(dto.getQuantity())
                .previousAvailableStock(prevAvailable)
                .newAvailableStock(savedInv.getAvailableStock())
                .previousAllocatedStock(savedInv.getAllocatedStock())
                .newAllocatedStock(savedInv.getAllocatedStock())
                .previousTotalStock(prevTotal)
                .newTotalStock(savedInv.getTotalStock())
                .referenceNumber("VENDOR-INB-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase())
                .notes(dto.getNotes() != null ? dto.getNotes() : "Vendor stock assigned and received at " + warehouse.getName())
                .performedBy(sender)
                .build();
        stockMovementRepository.save(movement);

        return mapToInventoryDTO(savedInv);
    }

    public List<ReturnResponseDto> getAllReturns(Long warehouseId, String status) {
        List<ReturnRequest> list;
        if (warehouseId != null && status != null && !status.equalsIgnoreCase("ALL")) {
            list = returnRequestRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId).stream()
                    .filter(r -> r.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        } else if (warehouseId != null) {
            list = returnRequestRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
        } else if (status != null && !status.equalsIgnoreCase("ALL")) {
            list = returnRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = returnRequestRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::mapToReturnResponseDTO).collect(Collectors.toList());
    }

    public List<ReturnResponseDto> getCustomerReturns(Long customerId) {
        return returnRequestRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToReturnResponseDTO)
                .collect(Collectors.toList());
    }

    private ReturnResponseDto mapToReturnResponseDTO(ReturnRequest r) {
        ReturnResponseDto dto = new ReturnResponseDto();
        dto.setId(r.getId());
        dto.setOrderId(r.getOrder().getId());
        dto.setOrderNumber(r.getOrder().getOrderNumber());
        if (r.getOrderItem() != null) {
            dto.setOrderItemId(r.getOrderItem().getId());
            dto.setProductId(r.getOrderItem().getProduct().getId());
            dto.setProductTitle(r.getOrderItem().getProduct().getTitle());
            dto.setProductImageUrl(r.getOrderItem().getProduct().getImageUrl());
            dto.setQuantity(r.getOrderItem().getQuantity());
        } else if (!r.getOrder().getItems().isEmpty()) {
            OrderItem first = r.getOrder().getItems().get(0);
            dto.setOrderItemId(first.getId());
            dto.setProductId(first.getProduct().getId());
            dto.setProductTitle(first.getProduct().getTitle());
            dto.setProductImageUrl(first.getProduct().getImageUrl());
            dto.setQuantity(first.getQuantity());
        }
        dto.setCustomerId(r.getCustomer().getId());
        dto.setCustomerName(r.getCustomer().getFullName());
        dto.setCustomerEmail(r.getCustomer().getEmail());
        if (r.getWarehouse() != null) {
            dto.setWarehouseId(r.getWarehouse().getId());
            dto.setWarehouseName(r.getWarehouse().getName());
            dto.setWarehouseCode(r.getWarehouse().getCode());
        }
        dto.setReason(r.getReason());
        dto.setReturnReasonType(r.getReturnReasonType());
        dto.setCustomerComments(r.getCustomerComments());
        dto.setStatus(r.getStatus());
        dto.setRefundAmount(r.getRefundAmount() != null ? r.getRefundAmount() : r.getOrder().getTotalAmount());
        dto.setAdminNotes(r.getAdminNotes());
        dto.setQcNotes(r.getQcNotes());
        dto.setQcDecision(r.getQcDecision());
        dto.setInspectedBy(r.getInspectedBy());
        dto.setInspectedAt(r.getInspectedAt());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }
}

