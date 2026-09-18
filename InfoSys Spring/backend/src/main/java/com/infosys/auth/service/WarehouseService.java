package com.infosys.auth.service;

import com.infosys.auth.model.*;
import com.infosys.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @PostConstruct
    public void seedInitialWarehouses() {
        try {
            if (warehouseRepository.count() == 0) {
                Warehouse w1 = new Warehouse("Bangalore Central Hub", "WH-BLR-01", "Bangalore", "Plot 42, Electronic City Phase 1, Bangalore", 50000, "+91 9876543210", "blr.hub@quickkart.com");
                Warehouse w2 = new Warehouse("Mumbai Western Terminal", "WH-MUM-01", "Mumbai", "Bldg 7, Bhiwandi Logistics Park, Mumbai", 65000, "+91 9876543211", "mum.hub@quickkart.com");
                Warehouse w3 = new Warehouse("Delhi NCR Distribution Center", "WH-DEL-01", "Delhi NCR", "Sector 18, Udyog Vihar, Gurugram, Delhi NCR", 80000, "+91 9876543212", "del.hub@quickkart.com");
                Warehouse w4 = new Warehouse("Hyderabad Tech Fulfilment", "WH-HYD-01", "Hyderabad", "Hardware Park, Shamshabad, Hyderabad", 45000, "+91 9876543213", "hyd.hub@quickkart.com");
                
                warehouseRepository.saveAll(List.of(w1, w2, w3, w4));

                // Seed inventory for existing products
                List<Product> products = productRepository.findAll();
                List<Warehouse> warehouses = warehouseRepository.findAll();
                
                for (Product p : products) {
                    int splitStock = (p.getStockQuantity() != null && p.getStockQuantity() > 0) ? p.getStockQuantity() / warehouses.size() : 25;
                    if (splitStock <= 0) splitStock = 20;

                    for (int i = 0; i < warehouses.size(); i++) {
                        Warehouse wh = warehouses.get(i);
                        String bin = "Aisle-" + ((i % 5) + 1) + "-Shelf-" + ((char)('A' + (i % 4))) + "-Bin-" + ((p.getId() % 30) + 1);
                        WarehouseInventory inv = new WarehouseInventory(wh.getId(), p.getId(), p.getName(), p.getSku(), splitStock, 0, bin);
                        warehouseInventoryRepository.save(inv);

                        StockMovement sm = new StockMovement(wh.getId(), wh.getName(), p.getId(), p.getName(), null, splitStock, StockMovement.MovementType.INWARD_STOCK, 1L, "System Admin", "Initial stock provisioning");
                        stockMovementRepository.save(sm);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Warning: Warehouse seeding skipped: " + e.getMessage());
        }
    }

    // --- Warehouse Management ---
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Optional<Warehouse> getWarehouseById(Long id) {
        return warehouseRepository.findById(id);
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public Warehouse updateWarehouse(Long id, Warehouse updated) {
        Warehouse wh = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with ID: " + id));
        wh.setName(updated.getName());
        wh.setLocationCity(updated.getLocationCity());
        wh.setAddress(updated.getAddress());
        wh.setCapacity(updated.getCapacity());
        wh.setContactNumber(updated.getContactNumber());
        wh.setContactEmail(updated.getContactEmail());
        wh.setActive(updated.isActive());
        return warehouseRepository.save(wh);
    }

    // --- Inventory & Stock Movement ---
    public List<WarehouseInventory> getWarehouseInventory(Long warehouseId) {
        return warehouseInventoryRepository.findByWarehouseId(warehouseId);
    }

    public List<StockMovement> getWarehouseStockMovements(Long warehouseId) {
        if (warehouseId != null && warehouseId > 0) {
            return stockMovementRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
        }
        return stockMovementRepository.findTop100ByOrderByCreatedAtDesc();
    }

    @Transactional
    public WarehouseInventory inwardStock(Long warehouseId, Long productId, Integer quantity, Long staffId, String staffName, String aisleBin, String note) {
        Warehouse wh = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WarehouseInventory inv = warehouseInventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                .orElse(new WarehouseInventory(warehouseId, productId, p.getName(), p.getSku(), 0, 0, aisleBin != null ? aisleBin : "Aisle-1-Shelf-A-Bin-1"));

        inv.setAvailableQuantity(inv.getAvailableQuantity() + quantity);
        if (aisleBin != null && !aisleBin.trim().isEmpty()) {
            inv.setAisleBinLocation(aisleBin);
        }
        inv.setProductName(p.getName());
        inv.setProductSku(p.getSku());
        WarehouseInventory saved = warehouseInventoryRepository.save(inv);

        // Sync master product stock
        Integer totalStock = warehouseInventoryRepository.getTotalAvailableStockForProduct(productId);
        if (totalStock != null) {
            p.setStockQuantity(totalStock);
            productRepository.save(p);
        }

        // Record stock movement
        StockMovement sm = new StockMovement(wh.getId(), wh.getName(), p.getId(), p.getName(), null, quantity, StockMovement.MovementType.INWARD_STOCK, staffId, staffName, note != null ? note : "Inward stock replenishment");
        stockMovementRepository.save(sm);

        return saved;
    }

    @Transactional
    public WarehouseInventory adjustStock(Long warehouseId, Long productId, Integer newQuantity, String reason, Long staffId, String staffName) {
        Warehouse wh = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WarehouseInventory inv = warehouseInventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                .orElse(new WarehouseInventory(warehouseId, productId, p.getName(), p.getSku(), 0, 0, "Aisle-1-Shelf-A-Bin-1"));

        int diff = newQuantity - inv.getAvailableQuantity();
        inv.setAvailableQuantity(Math.max(0, newQuantity));
        WarehouseInventory saved = warehouseInventoryRepository.save(inv);

        // Sync product stock
        Integer totalStock = warehouseInventoryRepository.getTotalAvailableStockForProduct(productId);
        if (totalStock != null) {
            p.setStockQuantity(totalStock);
            productRepository.save(p);
        }

        StockMovement sm = new StockMovement(wh.getId(), wh.getName(), p.getId(), p.getName(), null, diff, StockMovement.MovementType.MANUAL_ADJUSTMENT, staffId, staffName, "Adjustment: " + reason);
        stockMovementRepository.save(sm);

        return saved;
    }

    // --- Automated Warehouse Allocation Workflow ---
    @Transactional
    public Order allocateOrderToWarehouse(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            return order;
        }

        List<Warehouse> activeWarehouses = warehouseRepository.findByActiveTrue();
        if (activeWarehouses.isEmpty()) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            return orderRepository.save(order);
        }

        Warehouse selectedWarehouse = null;

        // Try to find a single warehouse that can fulfill all items
        for (Warehouse wh : activeWarehouses) {
            boolean canFulfillAll = true;
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = warehouseInventoryRepository.findByWarehouseIdAndProductId(wh.getId(), item.getProductId());
                if (invOpt.isEmpty() || invOpt.get().getEffectiveStock() < item.getQuantity()) {
                    canFulfillAll = false;
                    break;
                }
            }
            if (canFulfillAll) {
                selectedWarehouse = wh;
                break;
            }
        }

        // Fallback: pick the warehouse with highest stock for the primary/first item
        if (selectedWarehouse == null && !order.getItems().isEmpty()) {
            Long primaryProductId = order.getItems().get(0).getProductId();
            List<WarehouseInventory> invList = warehouseInventoryRepository.findWarehousesWithAvailableStock(primaryProductId, 1);
            if (!invList.isEmpty()) {
                selectedWarehouse = warehouseRepository.findById(invList.get(0).getWarehouseId()).orElse(activeWarehouses.get(0));
            } else {
                selectedWarehouse = activeWarehouses.get(0);
            }
        }

        if (selectedWarehouse != null) {
            order.setWarehouseId(selectedWarehouse.getId());
            order.setWarehouseName(selectedWarehouse.getName());
            order.setWarehouseCode(selectedWarehouse.getCode());
            order.setStatus(Order.OrderStatus.ALLOCATED);

            // Reserve stock and record movement
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = warehouseInventoryRepository.findByWarehouseIdAndProductId(selectedWarehouse.getId(), item.getProductId());
                if (invOpt.isPresent()) {
                    WarehouseInventory inv = invOpt.get();
                    inv.setReservedQuantity(inv.getReservedQuantity() + item.getQuantity());
                    warehouseInventoryRepository.save(inv);

                    StockMovement sm = new StockMovement(
                            selectedWarehouse.getId(),
                            selectedWarehouse.getName(),
                            item.getProductId(),
                            item.getProductName(),
                            order.getId(),
                            -item.getQuantity(),
                            StockMovement.MovementType.ALLOCATED,
                            null,
                            "System Auto-Allocator",
                            "Stock reserved for Order #" + order.getId()
                    );
                    stockMovementRepository.save(sm);
                }
            }
        }

        return orderRepository.save(order);
    }

    // --- Warehouse Staff Operations: Pick, Pack, Prepare Shipment ---
    @Transactional
    public Order pickOrder(Long orderId, Long staffId, String staffName) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        order.setStatus(Order.OrderStatus.PICKED);
        order.setPickedAt(LocalDateTime.now());
        order.setPickedByStaffId(staffId);
        order.setPickedByStaffName(staffName);

        for (OrderItem item : order.getItems()) {
            StockMovement sm = new StockMovement(
                    order.getWarehouseId(),
                    order.getWarehouseName(),
                    item.getProductId(),
                    item.getProductName(),
                    order.getId(),
                    0,
                    StockMovement.MovementType.PICKED,
                    staffId,
                    staffName,
                    "Items picked from shelf bin by " + staffName
            );
            stockMovementRepository.save(sm);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order packOrder(Long orderId, Long staffId, String staffName, String packagingNote) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        order.setStatus(Order.OrderStatus.PACKED);
        order.setPackedAt(LocalDateTime.now());
        order.setPackedByStaffId(staffId);
        order.setPackedByStaffName(staffName);

        for (OrderItem item : order.getItems()) {
            StockMovement sm = new StockMovement(
                    order.getWarehouseId(),
                    order.getWarehouseName(),
                    item.getProductId(),
                    item.getProductName(),
                    order.getId(),
                    0,
                    StockMovement.MovementType.PACKED,
                    staffId,
                    staffName,
                    "Order packed and sealed: " + (packagingNote != null ? packagingNote : "Standard Box A")
            );
            stockMovementRepository.save(sm);
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order prepareShipment(Long orderId, String carrier, String trackingNumber, Long staffId, String staffName) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        String actualCarrier = (carrier != null && !carrier.trim().isEmpty()) ? carrier : "BlueDart Logistics";
        String actualTracking = (trackingNumber != null && !trackingNumber.trim().isEmpty()) ? trackingNumber : "TRK-" + System.currentTimeMillis();

        order.setStatus(Order.OrderStatus.SHIPPED);
        order.setShippedAt(LocalDateTime.now());
        order.setCarrierName(actualCarrier);
        order.setTrackingNumber(actualTracking);

        // Physically deduct inventory and clear reservation
        if (order.getWarehouseId() != null) {
            for (OrderItem item : order.getItems()) {
                Optional<WarehouseInventory> invOpt = warehouseInventoryRepository.findByWarehouseIdAndProductId(order.getWarehouseId(), item.getProductId());
                if (invOpt.isPresent()) {
                    WarehouseInventory inv = invOpt.get();
                    inv.setAvailableQuantity(Math.max(0, inv.getAvailableQuantity() - item.getQuantity()));
                    inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - item.getQuantity()));
                    warehouseInventoryRepository.save(inv);

                    // Sync product master stock
                    Integer remainingStock = warehouseInventoryRepository.getTotalAvailableStockForProduct(item.getProductId());
                    productRepository.findById(item.getProductId()).ifPresent(p -> {
                        p.setStockQuantity(remainingStock != null ? remainingStock : 0);
                        productRepository.save(p);
                    });

                    StockMovement sm = new StockMovement(
                            order.getWarehouseId(),
                            order.getWarehouseName(),
                            item.getProductId(),
                            item.getProductName(),
                            order.getId(),
                            -item.getQuantity(),
                            StockMovement.MovementType.SHIPPED,
                            staffId,
                            staffName,
                            "Dispatched with " + actualCarrier + " (" + actualTracking + ")"
                    );
                    stockMovementRepository.save(sm);
                }
            }
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order deliverOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        order.setStatus(Order.OrderStatus.DELIVERED);
        order.setDeliveredAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public void deallocateCancelledOrder(Order order) {
        if (order == null || order.getWarehouseId() == null) return;

        for (OrderItem item : order.getItems()) {
            Optional<WarehouseInventory> invOpt = warehouseInventoryRepository.findByWarehouseIdAndProductId(order.getWarehouseId(), item.getProductId());
            if (invOpt.isPresent()) {
                WarehouseInventory inv = invOpt.get();
                inv.setReservedQuantity(Math.max(0, inv.getReservedQuantity() - item.getQuantity()));
                warehouseInventoryRepository.save(inv);

                StockMovement sm = new StockMovement(
                        order.getWarehouseId(),
                        order.getWarehouseName(),
                        item.getProductId(),
                        item.getProductName(),
                        order.getId(),
                        item.getQuantity(),
                        StockMovement.MovementType.CANCELLED_RESTOCK,
                        null,
                        "System Auto-Cancel",
                        "Reservation released for cancelled Order #" + order.getId()
                );
                stockMovementRepository.save(sm);
            }
        }
    }

    // --- Warehouse Analytics & Staff Order Queue ---
    public List<Order> getStaffOrderQueue(Long warehouseId) {
        if (warehouseId != null && warehouseId > 0) {
            return orderRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId);
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    // Returns only ALLOCATED, PICKED, PACKED orders — actionable by warehouse staff
    public List<Order> getActiveStaffOrders(Long warehouseId) {
        List<Order.OrderStatus> activeStatuses = List.of(
                Order.OrderStatus.ALLOCATED,
                Order.OrderStatus.PICKED,
                Order.OrderStatus.PACKED
        );
        if (warehouseId != null && warehouseId > 0) {
            return orderRepository.findByWarehouseIdOrderByCreatedAtDesc(warehouseId)
                    .stream()
                    .filter(o -> activeStatuses.contains(o.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(o -> activeStatuses.contains(o.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    public Map<String, Object> getWarehouseAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        int totalCapacity = warehouses.stream().mapToInt(Warehouse::getCapacity).sum();
        int activeWarehouses = (int) warehouses.stream().filter(Warehouse::isActive).count();

        long pendingPickCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.ALLOCATED || o.getStatus() == Order.OrderStatus.PROCESSING || o.getStatus() == Order.OrderStatus.CONFIRMED).count();
        long pendingPackCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PICKED).count();
        long readyToShipCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.PACKED).count();
        long shippedCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.SHIPPED).count();
        long deliveredCount = allOrders.stream().filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED).count();

        List<WarehouseInventory> allInventory = warehouseInventoryRepository.findAll();
        int totalPhysicalItems = allInventory.stream().mapToInt(WarehouseInventory::getAvailableQuantity).sum();
        long lowStockCount = allInventory.stream().filter(i -> i.getEffectiveStock() <= i.getReorderThreshold()).count();

        stats.put("totalWarehouses", warehouses.size());
        stats.put("activeWarehouses", activeWarehouses);
        stats.put("totalCapacity", totalCapacity);
        stats.put("totalStockOccupied", totalPhysicalItems);
        stats.put("utilizationPercentage", totalCapacity > 0 ? (int)((double)totalPhysicalItems / totalCapacity * 100) : 0);
        stats.put("pendingPickCount", pendingPickCount);
        stats.put("pendingPackCount", pendingPackCount);
        stats.put("readyToShipCount", readyToShipCount);
        stats.put("shippedCount", shippedCount);
        stats.put("deliveredCount", deliveredCount);
        stats.put("lowStockAlertCount", lowStockCount);

        return stats;
    }
}
