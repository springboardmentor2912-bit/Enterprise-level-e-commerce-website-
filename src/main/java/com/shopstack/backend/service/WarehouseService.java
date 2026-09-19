package com.shopstack.backend.service;

import com.shopstack.backend.dto.*;
import com.shopstack.backend.entity.*;
import com.shopstack.backend.enums.*;
import com.shopstack.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarehouseService {
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository inventoryRepository;
    private final WarehouseAllocationRepository allocationRepository;
    private final StockMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public WarehouseService(WarehouseRepository warehouseRepository,
                            WarehouseInventoryRepository inventoryRepository,
                            WarehouseAllocationRepository allocationRepository,
                            StockMovementRepository movementRepository,
                            ProductRepository productRepository,
                            OrderRepository orderRepository,
                            UserRepository userRepository) {
        this.warehouseRepository = warehouseRepository;
        this.inventoryRepository = inventoryRepository;
        this.allocationRepository = allocationRepository;
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // ==================== ADMIN: WAREHOUSES ====================
    public List<WarehouseResponse> getWarehouses() {
        return warehouseRepository.findAll().stream().map(this::warehouseResponse).toList();
    }

    public WarehouseResponse createWarehouse(WarehouseRequest request) {
        if (request.getName() == null || request.getName().isBlank() || request.getCode() == null || request.getCode().isBlank())
            throw new RuntimeException("Warehouse name and code are required");
        String code = request.getCode().trim().toUpperCase();
        if (warehouseRepository.findByCode(code).isPresent()) throw new RuntimeException("Warehouse code already exists");
        Warehouse w = new Warehouse();
        applyWarehouse(w, request, code);
        return warehouseResponse(warehouseRepository.save(w));
    }

    public WarehouseResponse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse w = getWarehouse(id);
        String code = request.getCode() == null || request.getCode().isBlank() ? w.getCode() : request.getCode().trim().toUpperCase();
        warehouseRepository.findByCode(code).filter(other -> !other.getId().equals(id)).ifPresent(x -> { throw new RuntimeException("Warehouse code already exists"); });
        applyWarehouse(w, request, code);
        return warehouseResponse(warehouseRepository.save(w));
    }

    public void deleteWarehouse(Long id) {
        Warehouse w = getWarehouse(id);
        if (!inventoryRepository.findByWarehouse(w).isEmpty() || !allocationRepository.findByWarehouseOrderByAllocatedAtDesc(w).isEmpty())
            throw new RuntimeException("Warehouse cannot be deleted after inventory or allocations exist. Deactivate it instead.");
        warehouseRepository.delete(w);
    }

    private void applyWarehouse(Warehouse w, WarehouseRequest r, String code) {
        if (r.getName() != null) w.setName(r.getName());
        w.setCode(code);
        w.setAddress(r.getAddress()); w.setCity(r.getCity()); w.setState(r.getState()); w.setPincode(r.getPincode());
        if (r.getActive() != null) w.setActive(r.getActive());
    }

    // ==================== ADMIN: INVENTORY ====================
    @Transactional
    public WarehouseInventoryResponse upsertInventory(Long warehouseId, WarehouseInventoryRequest request) {
        if (request.getProductId() == null || request.getQuantity() == null || request.getQuantity() < 0)
            throw new RuntimeException("Product and non-negative quantity are required");
        Warehouse w = getWarehouse(warehouseId);
        Product p = productRepository.findById(request.getProductId()).orElseThrow(() -> new RuntimeException("Product not found"));
        WarehouseInventory inv = inventoryRepository.findByWarehouseAndProduct(w, p).orElseGet(() -> {
            WarehouseInventory x = new WarehouseInventory(); x.setWarehouse(w); x.setProduct(p); x.setQuantity(0); x.setReservedQuantity(0); return x;
        });
        if (request.getQuantity() < inv.getReservedQuantity()) throw new RuntimeException("Quantity cannot be lower than reserved stock");
        inv.setQuantity(request.getQuantity());
        return inventoryResponse(inventoryRepository.save(inv));
    }

    public List<WarehouseInventoryResponse> getInventory(Long warehouseId) {
        Warehouse w = getWarehouse(warehouseId);
        return inventoryRepository.findByWarehouse(w).stream().map(this::inventoryResponse).toList();
    }

    public List<WarehouseInventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream().map(this::inventoryResponse).toList();
    }

    // ==================== ALLOCATION ====================
    @Transactional
    public WarehouseAllocationResponse allocateOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getStatus() != OrderStatus.CONFIRMED) throw new RuntimeException("Only confirmed orders can be allocated");
        Optional<WarehouseAllocation> existing = allocationRepository.findByOrder(order);
        if (existing.isPresent() && existing.get().getStatus() != WarehouseAllocationStatus.FAILED && existing.get().getStatus() != WarehouseAllocationStatus.RELEASED)
            return allocationResponse(existing.get());

        List<Warehouse> warehouses = warehouseRepository.findAll().stream().filter(w -> Boolean.TRUE.equals(w.getActive())).toList();
        Warehouse selected = null;
        for (Warehouse w : warehouses) {
            boolean fits = true;
            for (OrderItem item : order.getItems()) {
                WarehouseInventory inv = inventoryRepository.findByWarehouseAndProduct(w, item.getProduct()).orElse(null);
                if (inv == null || inv.getAvailableQuantity() < item.getQuantity()) { fits = false; break; }
            }
            if (fits) { selected = w; break; }
        }
        if (selected == null) throw new RuntimeException("No active warehouse has sufficient stock for this order");

        WarehouseAllocation allocation = new WarehouseAllocation();
        allocation.setOrder(order); allocation.setWarehouse(selected); allocation.setStatus(WarehouseAllocationStatus.ALLOCATED); allocation.setAllocatedAt(LocalDateTime.now());
        User firstStaff = userRepository.findByWarehouse(selected).stream().filter(u -> u.getRole() == Role.WAREHOUSE_STAFF).findFirst().orElse(null);
        allocation.setAssignedStaff(firstStaff);

        for (OrderItem item : order.getItems()) {
            WarehouseInventory inv = inventoryRepository.findByWarehouseAndProduct(selected, item.getProduct()).orElseThrow();
            inv.setReservedQuantity(inv.getReservedQuantity() + item.getQuantity());
            inventoryRepository.save(inv);

            WarehouseAllocationItem ai = new WarehouseAllocationItem();
            ai.setAllocation(allocation); ai.setProduct(item.getProduct()); ai.setQuantity(item.getQuantity()); ai.setPickedQuantity(0);
            allocation.getItems().add(ai);
            createMovement(selected, item.getProduct(), order, firstStaff, StockMovementType.RESERVED, item.getQuantity());
        }
        return allocationResponse(allocationRepository.save(allocation));
    }

    @Transactional
    public void releaseAllocation(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        WarehouseAllocation a = allocationRepository.findByOrder(order).orElse(null);
        if (a == null || a.getStatus() == WarehouseAllocationStatus.RELEASED || a.getStatus() == WarehouseAllocationStatus.FAILED) return;
        if (a.getStatus() != WarehouseAllocationStatus.ALLOCATED)
            throw new RuntimeException("Warehouse allocation cannot be released after picking has started");
        for (WarehouseAllocationItem item : a.getItems()) {
            WarehouseInventory inv = inventoryRepository.findByWarehouseAndProduct(a.getWarehouse(), item.getProduct()).orElse(null);
            if (inv != null) {
                inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - item.getQuantity()));
                inventoryRepository.save(inv);
                createMovement(a.getWarehouse(), item.getProduct(), order, a.getAssignedStaff(), StockMovementType.RELEASED, item.getQuantity());
            }
        }
        a.setStatus(WarehouseAllocationStatus.RELEASED);
        allocationRepository.save(a);
    }

    // ==================== STAFF ====================
    public List<WarehouseAllocationResponse> getStaffOrders(String email) {
        User staff = getStaff(email);
        if (staff.getWarehouse() == null) return List.of();
        return allocationRepository.findByWarehouseOrderByAllocatedAtDesc(staff.getWarehouse()).stream()
                .filter(a -> a.getStatus() != WarehouseAllocationStatus.RELEASED && a.getStatus() != WarehouseAllocationStatus.FAILED)
                .map(this::allocationResponse).toList();
    }

    @Transactional
    public WarehouseAllocationResponse claim(Long allocationId, String email) {
        User staff = getStaff(email); requireWarehouse(staff);
        WarehouseAllocation a = getAllocation(allocationId);
        requireStaffWarehouse(staff, a);
        if (a.getStatus() != WarehouseAllocationStatus.ALLOCATED) throw new RuntimeException("Only allocated orders can be claimed");
        a.setAssignedStaff(staff);
        return allocationResponse(allocationRepository.save(a));
    }

    @Transactional
    public WarehouseAllocationResponse pick(Long allocationId, String email) {
        User staff = getStaff(email); requireWarehouse(staff);
        WarehouseAllocation a = getAllocation(allocationId); requireStaffWarehouse(staff, a);
        if (a.getStatus() != WarehouseAllocationStatus.ALLOCATED && a.getStatus() != WarehouseAllocationStatus.PICKING)
            throw new RuntimeException("Order is not ready for picking");
        a.setAssignedStaff(staff); a.setStatus(WarehouseAllocationStatus.PICKING);
        for (WarehouseAllocationItem item : a.getItems()) {
            int remaining = item.getQuantity() - item.getPickedQuantity();
            if (remaining <= 0) continue;
            WarehouseInventory inv = inventoryRepository.findByWarehouseAndProduct(a.getWarehouse(), item.getProduct()).orElseThrow(() -> new RuntimeException("Warehouse inventory not found"));
            if (inv.getReservedQuantity() < remaining || inv.getQuantity() < remaining) throw new RuntimeException("Insufficient reserved stock for " + item.getProduct().getName());
            inv.setReservedQuantity(inv.getReservedQuantity() - remaining);
            inv.setQuantity(inv.getQuantity() - remaining);
            inventoryRepository.save(inv);
            item.setPickedQuantity(item.getQuantity());
            createMovement(a.getWarehouse(), item.getProduct(), a.getOrder(), staff, StockMovementType.PICKED, remaining);
        }
        a.setPickedAt(LocalDateTime.now()); a.setStatus(WarehouseAllocationStatus.PICKED);
        return allocationResponse(allocationRepository.save(a));
    }

    @Transactional
    public WarehouseAllocationResponse pack(Long allocationId, String email) {
        User staff = getStaff(email); requireWarehouse(staff);
        WarehouseAllocation a = getAllocation(allocationId); requireStaffWarehouse(staff, a);
        if (a.getStatus() != WarehouseAllocationStatus.PICKED) throw new RuntimeException("Order must be picked before packing");
        a.setAssignedStaff(staff); a.setStatus(WarehouseAllocationStatus.PACKING); a.setPackedAt(LocalDateTime.now());
        for (WarehouseAllocationItem item : a.getItems()) createMovement(a.getWarehouse(), item.getProduct(), a.getOrder(), staff, StockMovementType.PACKED, item.getQuantity());
        a.setStatus(WarehouseAllocationStatus.PACKED);
        return allocationResponse(allocationRepository.save(a));
    }

    @Transactional
    public WarehouseAllocationResponse readyForShipping(Long allocationId, String email) {
        User staff = getStaff(email); requireWarehouse(staff);
        WarehouseAllocation a = getAllocation(allocationId); requireStaffWarehouse(staff, a);
        if (a.getStatus() != WarehouseAllocationStatus.PACKED) throw new RuntimeException("Order must be packed before shipment preparation");
        a.setAssignedStaff(staff); a.setStatus(WarehouseAllocationStatus.READY_FOR_SHIPPING); a.setReadyAt(LocalDateTime.now());
        if (a.getOrder().getStatus() == OrderStatus.CONFIRMED) {
            a.getOrder().setStatus(OrderStatus.PROCESSING);
            orderRepository.save(a.getOrder());
        }
        for (WarehouseAllocationItem item : a.getItems()) createMovement(a.getWarehouse(), item.getProduct(), a.getOrder(), staff, StockMovementType.SHIPMENT_READY, item.getQuantity());
        return allocationResponse(allocationRepository.save(a));
    }

    public List<StockMovementResponse> getMovements(Long warehouseId) {
        Warehouse w = getWarehouse(warehouseId);
        return movementRepository.findByWarehouseOrderByCreatedAtDesc(w).stream().map(this::movementResponse).toList();
    }

    public WarehouseAnalyticsResponse analytics() {
        return new WarehouseAnalyticsResponse(
                warehouseRepository.count(),
                warehouseRepository.findAll().stream().filter(w -> Boolean.TRUE.equals(w.getActive())).count(),
                allocationRepository.countByStatus(WarehouseAllocationStatus.ALLOCATED),
                allocationRepository.countByStatus(WarehouseAllocationStatus.PICKING),
                allocationRepository.countByStatus(WarehouseAllocationStatus.PACKED),
                allocationRepository.countByStatus(WarehouseAllocationStatus.READY_FOR_SHIPPING),
                movementRepository.count()
        );
    }

    private void createMovement(Warehouse w, Product p, Order o, User staff, StockMovementType type, int qty) {
        StockMovement m = new StockMovement(); m.setWarehouse(w); m.setProduct(p); m.setOrder(o); m.setStaff(staff); m.setType(type); m.setQuantity(qty); m.setCreatedAt(LocalDateTime.now()); movementRepository.save(m);
    }
    private Warehouse getWarehouse(Long id){return warehouseRepository.findById(id).orElseThrow(() -> new RuntimeException("Warehouse not found"));}
    private WarehouseAllocation getAllocation(Long id){return allocationRepository.findById(id).orElseThrow(() -> new RuntimeException("Warehouse allocation not found"));}
    private User getStaff(String email){return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Staff user not found"));}
    private void requireWarehouse(User u){if(u.getWarehouse()==null) throw new RuntimeException("No warehouse is assigned to this staff member");}
    private void requireStaffWarehouse(User u, WarehouseAllocation a){if(!u.getWarehouse().getId().equals(a.getWarehouse().getId())) throw new RuntimeException("Access denied for this warehouse");}
    private WarehouseResponse warehouseResponse(Warehouse w){return new WarehouseResponse(w.getId(),w.getName(),w.getCode(),w.getAddress(),w.getCity(),w.getState(),w.getPincode(),w.getActive());}
    private WarehouseInventoryResponse inventoryResponse(WarehouseInventory i){return new WarehouseInventoryResponse(i.getId(),i.getWarehouse().getId(),i.getWarehouse().getName(),i.getProduct().getId(),i.getProduct().getName(),i.getQuantity(),i.getReservedQuantity(),i.getAvailableQuantity());}
    private WarehouseAllocationResponse allocationResponse(WarehouseAllocation a){return new WarehouseAllocationResponse(a.getId(),a.getOrder().getId(),a.getWarehouse().getId(),a.getWarehouse().getName(),a.getAssignedStaff()==null?null:a.getAssignedStaff().getId(),a.getAssignedStaff()==null?null:a.getAssignedStaff().getName(),a.getStatus(),a.getAllocatedAt(),a.getItems().stream().map(i->new WarehouseAllocationResponse.Item(i.getProduct().getId(),i.getProduct().getName(),i.getQuantity(),i.getPickedQuantity())).toList());}
    private StockMovementResponse movementResponse(StockMovement m){return new StockMovementResponse(m.getId(),m.getWarehouse().getId(),m.getProduct().getId(),m.getProduct().getName(),m.getOrder()==null?null:m.getOrder().getId(),m.getStaff()==null?null:m.getStaff().getId(),m.getType(),m.getQuantity(),m.getCreatedAt());}
}
