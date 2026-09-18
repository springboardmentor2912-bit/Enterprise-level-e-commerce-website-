package com.shopstack.backend.service;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.model.WarehouseAllocation;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseAllocationRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.model.User;
import com.shopstack.backend.event.OrderShippedEvent;
import com.shopstack.backend.event.OrderDeliveredEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseAllocationRepository allocationRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    @org.springframework.context.annotation.Lazy
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    /**
     * Synchronizes a product's global stock field to equal the sum of available stock across all warehouses.
     */
    public void syncProductGlobalStock(Long productId) {
        List<Inventory> inventories = inventoryRepository.findByProductId(productId);
        int totalAvailable = inventories.stream()
                .mapToInt(Inventory::getAvailableQuantity)
                .sum();
        productRepository.findById(productId).ifPresent(product -> {
            product.setStock(totalAvailable);
            productRepository.save(product);
        });
    }

    /**
     * Distributes a product's stock across specified warehouses (e.g. Kolkata, Mumbai, Delhi, Bangalore).
     */
    @Transactional
    public List<Inventory> distributeProductStock(Long productId, List<Map<String, Object>> distributions) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));

        List<Inventory> updatedInventories = new ArrayList<>();

        for (Map<String, Object> dist : distributions) {
            if (!dist.containsKey("warehouseId") || !dist.containsKey("quantity")) {
                continue;
            }
            Long warehouseId = Long.parseLong(dist.get("warehouseId").toString());
            int quantity = Integer.parseInt(dist.get("quantity").toString());

            Warehouse warehouse = warehouseRepository.findById(warehouseId)
                    .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + warehouseId));

            Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                    .orElseGet(() -> new Inventory(warehouse, product, 0));

            inv.setQuantity(Math.max(0, quantity));
            updatedInventories.add(inventoryRepository.save(inv));
        }

        syncProductGlobalStock(productId);
        return updatedInventories;
    }

    /**
     * Automatically allocates warehouse stock for all items in a confirmed order.
     * Follows the rule: checks active warehouses with available stock (physical - allocated),
     * selects a suitable warehouse with sufficient stock or splits across hubs,
     * and reserves the stock (status: ALLOCATED) for Warehouse Staff picking & packing.
     */
    @Transactional
    public List<WarehouseAllocation> allocateOrder(String orderId) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String st = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
            if ("DELIVERED".equals(st) || "SHIPPED".equals(st) || "OUT_FOR_DELIVERY".equals(st) || 
                "PACKED".equals(st) || "PICKED".equals(st) || "COMPLETED".equals(st) || 
                "CANCELLED".equals(st) || "REFUNDED".equals(st)) {
                return allocationRepository.findByOrderId(orderId);
            }
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<WarehouseAllocation> allocations = new ArrayList<>();

        // Release any existing allocations first to avoid duplicates
        releaseAllocations(orderId);

        for (OrderItem item : items) {
            Long productId = item.getProductId();
            int qtyToAllocate = item.getQuantity();

            // Find all active warehouses with inventory for this product
            List<Inventory> activeInventories = inventoryRepository.findByProductId(productId).stream()
                    .filter(inv -> inv.getWarehouse() != null && inv.getWarehouse().isActive())
                    .collect(Collectors.toList());

            // 1. Try to find a single warehouse with enough available stock (quantity - allocated)
            Optional<Inventory> singleFulfillmentWh = activeInventories.stream()
                    .filter(inv -> inv.getAvailableQuantity() >= qtyToAllocate)
                    .findFirst();

            if (singleFulfillmentWh.isPresent()) {
                Inventory inv = singleFulfillmentWh.get();
                inv.setAllocated(inv.getAllocated() + qtyToAllocate);
                inventoryRepository.save(inv);

                WarehouseAllocation alloc = new WarehouseAllocation(
                        orderId, item.getId(), productId, inv.getWarehouse(), qtyToAllocate, "ALLOCATED"
                );
                allocations.add(allocationRepository.save(alloc));
            } else {
                // 2. If no single warehouse has enough stock, split across warehouses by highest available stock
                int remaining = qtyToAllocate;
                
                activeInventories.sort((a, b) -> Integer.compare(b.getAvailableQuantity(), a.getAvailableQuantity()));

                for (Inventory inv : activeInventories) {
                    int available = inv.getAvailableQuantity();
                    if (available > 0) {
                        int allocQty = Math.min(remaining, available);
                        inv.setAllocated(inv.getAllocated() + allocQty);
                        inventoryRepository.save(inv);

                        WarehouseAllocation alloc = new WarehouseAllocation(
                                orderId, item.getId(), productId, inv.getWarehouse(), allocQty, "ALLOCATED"
                        );
                        allocations.add(allocationRepository.save(alloc));
                        remaining -= allocQty;

                        if (remaining == 0) {
                            break;
                        }
                    }
                }

                // 3. If there is still a remaining unallocated quantity, assign it to an UNALLOCATED state
                if (remaining > 0) {
                    WarehouseAllocation unalloc = new WarehouseAllocation(
                            orderId, item.getId(), productId, null, remaining, "UNALLOCATED"
                    );
                    allocations.add(allocationRepository.save(unalloc));
                }
            }
        }

        // Sync global available stock representation for all items in the order
        for (OrderItem item : items) {
            if (item.getProductId() != null) {
                syncProductGlobalStock(item.getProductId());
            }
        }

        return allocations;
    }

    /**
     * Allocates all items of an order to a specific designated warehouse chosen by the Admin.
     */
    @Transactional
    public List<WarehouseAllocation> allocateEntireOrderToWarehouse(String orderId, Long warehouseId) {
        Order order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with ID: " + orderId));

        String currentStatus = order.getStatus() != null ? order.getStatus().toUpperCase() : "";
        if ("DELIVERED".equals(currentStatus) || "SHIPPED".equals(currentStatus) || 
            "OUT_FOR_DELIVERY".equals(currentStatus) || "PACKED".equals(currentStatus) || 
            "PICKED".equals(currentStatus) || "COMPLETED".equals(currentStatus) || 
            "CANCELLED".equals(currentStatus) || "REFUNDED".equals(currentStatus)) {
            throw new IllegalStateException("Order " + orderId + " is already in stage '" + currentStatus + "' and cannot be re-allocated.");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found with ID: " + warehouseId));

        if (!warehouse.isActive()) {
            throw new IllegalStateException("Cannot allocate order to an inactive warehouse.");
        }

        // Release any existing partial allocations for this order first
        List<WarehouseAllocation> existingAllocs = allocationRepository.findByOrderId(orderId);
        for (WarehouseAllocation existing : existingAllocs) {
            if (existing.getWarehouse() != null) {
                Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(
                        existing.getWarehouse().getId(), existing.getProductId());
                if (invOpt.isPresent()) {
                    Inventory inv = invOpt.get();
                    inv.setAllocated(Math.max(0, inv.getAllocated() - existing.getQuantity()));
                    inventoryRepository.save(inv);
                }
            }
            allocationRepository.delete(existing);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<WarehouseAllocation> newAllocations = new ArrayList<>();

        for (OrderItem item : items) {
            Long productId = item.getProductId();
            int qtyToAllocate = item.getQuantity();

            Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                    .orElseGet(() -> {
                        Product product = productRepository.findById(productId)
                                .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productId));
                        return inventoryRepository.save(new Inventory(warehouse, product, 0));
                    });

            inv.setAllocated(inv.getAllocated() + qtyToAllocate);
            inventoryRepository.save(inv);

            WarehouseAllocation alloc = new WarehouseAllocation(
                    orderId, item.getId(), productId, warehouse, qtyToAllocate, "ALLOCATED"
            );
            newAllocations.add(allocationRepository.save(alloc));
            syncProductGlobalStock(productId);
        }

        order.setStatus("ALLOCATED");
        orderRepository.save(order);

        return newAllocations;
    }

    /**
     * Manually overrides or establishes an allocation of stock for a specific order item.
     */
    @Transactional
    public WarehouseAllocation manualAllocate(String orderId, Long orderItemId, Long warehouseId, int qty) {
        Optional<Order> orderOpt = orderRepository.findByOrderId(orderId);
        if (orderOpt.isPresent()) {
            String currentStatus = orderOpt.get().getStatus() != null ? orderOpt.get().getStatus().toUpperCase() : "";
            if ("DELIVERED".equals(currentStatus) || "SHIPPED".equals(currentStatus) || 
                "OUT_FOR_DELIVERY".equals(currentStatus) || "PACKED".equals(currentStatus) || 
                "PICKED".equals(currentStatus) || "COMPLETED".equals(currentStatus) || 
                "CANCELLED".equals(currentStatus) || "REFUNDED".equals(currentStatus)) {
                throw new IllegalStateException("Order " + orderId + " is already in stage '" + currentStatus + "' and cannot be re-allocated.");
            }
        }

        // Find the item details
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found"));

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found"));

        // If warehouse is inactive, block allocation
        if (!warehouse.isActive()) {
            throw new IllegalStateException("Cannot allocate to an inactive warehouse.");
        }

        // Find or create inventory for this warehouse & product
        Inventory inv = inventoryRepository.findByWarehouseIdAndProductId(warehouseId, item.getProductId())
                .orElseGet(() -> {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new IllegalArgumentException("Product not found"));
                    return inventoryRepository.save(new Inventory(warehouse, product, 0));
                });

        // Reserve allocated inventory
        inv.setAllocated(inv.getAllocated() + qty);
        inventoryRepository.save(inv);

        // Save allocation record
        WarehouseAllocation alloc = new WarehouseAllocation(
                orderId, orderItemId, item.getProductId(), warehouse, qty, "ALLOCATED"
        );
        WarehouseAllocation saved = allocationRepository.save(alloc);

        // Sync global stock representation
        syncProductGlobalStock(item.getProductId());

        return saved;
    }

    /**
     * Releases (de-allocates) stock for all allocations associated with an order (e.g. order cancelled/refunded).
     */
    @Transactional
    public void releaseAllocations(String orderId) {
        List<WarehouseAllocation> allocations = allocationRepository.findByOrderId(orderId);
        for (WarehouseAllocation alloc : allocations) {
            if (alloc.getWarehouse() != null) {
                // If not yet dispatched/shipped, release the allocated hold
                if (!"READY_FOR_SHIPMENT".equalsIgnoreCase(alloc.getStatus()) 
                        && !"READY_FOR_SHIPPING".equalsIgnoreCase(alloc.getStatus())
                        && !"DELIVERED".equalsIgnoreCase(alloc.getStatus())
                        && !"SHIPPED".equalsIgnoreCase(alloc.getStatus())) {
                    Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(
                            alloc.getWarehouse().getId(), alloc.getProductId()
                    );
                    if (invOpt.isPresent()) {
                        Inventory inv = invOpt.get();
                        inv.setAllocated(Math.max(0, inv.getAllocated() - alloc.getQuantity()));
                        inventoryRepository.save(inv);
                        syncProductGlobalStock(alloc.getProductId());
                    }
                }
            }
            allocationRepository.delete(alloc);
        }
    }

    /**
     * Advances the fulfillment workflow status of a specific warehouse allocation.
     * Workflow: ALLOCATED -> PICKED (Pick products) -> PACKED (Pack products) -> READY_FOR_SHIPPING / SHIPPED (Prepare shipment & dispatch).
     * Physical inventory movement is finalized at dispatch time.
     */
    @Transactional
    public WarehouseAllocation updateFulfillmentStatus(Long allocationId, String status, Map<String, Object> details) {
        WarehouseAllocation alloc = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found"));

        String oldStatus = alloc.getStatus();
        String newStatus = status.toUpperCase();

        if (oldStatus.equals(newStatus)) {
            return alloc;
        }

        alloc.setStatus(newStatus);
        alloc.setUpdatedAt(LocalDateTime.now());

        if ("PICKED".equals(newStatus)) {
            // Picked - physically retrieved from storage bins by Warehouse Staff.
        } 
        else if ("PACKED".equals(newStatus)) {
            // Packed - verified, packaged, and containerized by Warehouse Staff.
            if (details != null && details.containsKey("packagingType")) {
                alloc.setPackagingType(details.get("packagingType").toString());
            }
        } 
        else if ("READY_FOR_SHIPMENT".equals(newStatus) || "READY_FOR_SHIPPING".equals(newStatus) || "SHIPPED".equals(newStatus)) {
            // Prepare Shipment - assign logistics details and deduct physical inventory.
            if (details != null) {
                if (details.containsKey("courierPartner")) {
                    alloc.setCourierPartner(details.get("courierPartner").toString());
                } else {
                    alloc.setCourierPartner("ShopStack Express");
                }
                if (details.containsKey("trackingNumber") && details.get("trackingNumber") != null && !details.get("trackingNumber").toString().trim().isEmpty()) {
                    alloc.setTrackingNumber(details.get("trackingNumber").toString());
                }
            }
            if (alloc.getCourierPartner() == null || alloc.getCourierPartner().trim().isEmpty()) {
                alloc.setCourierPartner("ShopStack Express");
            }
            if (alloc.getTrackingNumber() == null || alloc.getTrackingNumber().trim().isEmpty()) {
                alloc.setTrackingNumber("TRK-SSX-" + (int)(10000000 + Math.random() * 90000000));
            }

            // Finalize physical stock movement: deduct physical quantity and release allocated hold
            if (alloc.getWarehouse() != null) {
                Optional<Inventory> invOpt = inventoryRepository.findByWarehouseIdAndProductId(
                        alloc.getWarehouse().getId(), alloc.getProductId()
                );
                if (invOpt.isPresent()) {
                    Inventory inv = invOpt.get();
                    inv.setQuantity(Math.max(0, inv.getQuantity() - alloc.getQuantity()));
                    inv.setAllocated(Math.max(0, inv.getAllocated() - alloc.getQuantity()));
                    inventoryRepository.save(inv);
                    syncProductGlobalStock(alloc.getProductId());
                }
            }
        }

        // Propagate Order status across the platform
        Optional<Order> orderOpt = orderRepository.findByOrderId(alloc.getOrderId());
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String oldOrderStatus = order.getStatus() != null ? order.getStatus() : "";
            User user = (order.getUserId() != null) ? userRepository.findById(order.getUserId()).orElse(null) : null;
            String timestamp = new java.text.SimpleDateFormat("MMM dd, yyyy HH:mm").format(new java.util.Date());

            if ("PICKED".equals(newStatus)) {
                order.setStatus("PICKED");
            } else if ("PACKED".equals(newStatus)) {
                order.setStatus("PACKED");
            } else if ("READY_FOR_SHIPMENT".equals(newStatus) || "READY_FOR_SHIPPING".equals(newStatus) || "SHIPPED".equals(newStatus)) {
                order.setStatus("SHIPPED");
                if (!"SHIPPED".equalsIgnoreCase(oldOrderStatus)) {
                    String tracking = alloc.getTrackingNumber() != null && !alloc.getTrackingNumber().isEmpty() 
                            ? alloc.getTrackingNumber() 
                            : ("TRK-" + Math.abs(order.getOrderId().hashCode()));
                    String whName = alloc.getWarehouse() != null ? alloc.getWarehouse().getName() : "ShopStack Fulfillment Center";
                    try {
                        eventPublisher.publishEvent(new OrderShippedEvent(order, tracking, whName, timestamp, user));
                    } catch (Exception e) {
                        System.err.println("[WarehouseService] Error publishing OrderShippedEvent: " + e.getMessage());
                    }
                }
            } else if ("DELIVERED".equals(newStatus)) {
                order.setStatus("DELIVERED");
                // For COD, mark as paid and trigger settlements
                if ("COD".equalsIgnoreCase(order.getPaymentMethod()) && "PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
                    order.setPaymentStatus("PAID");
                    List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                    paymentService.createSettlementsForOrder(order, items);
                }
                if (!"DELIVERED".equalsIgnoreCase(oldOrderStatus)) {
                    try {
                        eventPublisher.publishEvent(new OrderDeliveredEvent(order, timestamp, user));
                    } catch (Exception e) {
                        System.err.println("[WarehouseService] Error publishing OrderDeliveredEvent: " + e.getMessage());
                    }
                }
            }
            orderRepository.save(order);
        }

        return allocationRepository.save(alloc);
    }

    /**
     * Computes analytics metrics for warehouse capacities, occupancy, and tracking statuses.
     */
    public Map<String, Object> getAnalytics() {
        List<Warehouse> warehouses = warehouseRepository.findAll();
        List<Inventory> inventories = inventoryRepository.findAll();
        List<WarehouseAllocation> allocations = allocationRepository.findAll();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalWarehouses", warehouses.size());
        metrics.put("activeWarehouses", warehouses.stream().filter(Warehouse::isActive).count());

        int totalPhysicalStock = inventories.stream().mapToInt(Inventory::getQuantity).sum();
        int totalAllocatedStock = inventories.stream().mapToInt(Inventory::getAllocated).sum();
        int totalDamagedStock = inventories.stream().mapToInt(Inventory::getDamagedQuantity).sum();
        double totalDamagedValue = inventories.stream()
                .mapToDouble(i -> i.getDamagedQuantity() * (i.getProduct() != null ? i.getProduct().getPrice() : 0.0))
                .sum();

        metrics.put("totalPhysicalStock", totalPhysicalStock);
        metrics.put("totalAllocatedStock", totalAllocatedStock);
        metrics.put("totalAvailableStock", Math.max(0, totalPhysicalStock - totalAllocatedStock));
        metrics.put("totalDamagedStock", totalDamagedStock);
        metrics.put("totalDamagedValue", Math.round(totalDamagedValue * 100.0) / 100.0);

        // Status breakdown (null-safe)
        Map<String, Long> statusCounts = allocations.stream()
                .filter(a -> a.getStatus() != null)
                .collect(Collectors.groupingBy(WarehouseAllocation::getStatus, Collectors.counting()));
        metrics.put("statusBreakdown", statusCounts);

        // Warehouse capacity metrics (null-safe)
        List<Map<String, Object>> whDetails = warehouses.stream().map(wh -> {
            List<Inventory> whInv = inventories.stream()
                    .filter(i -> i.getWarehouse() != null && wh.getId().equals(i.getWarehouse().getId()))
                    .collect(Collectors.toList());

            int whQty = whInv.stream().mapToInt(Inventory::getQuantity).sum();
            int whAlloc = whInv.stream().mapToInt(Inventory::getAllocated).sum();
            int whDamaged = whInv.stream().mapToInt(Inventory::getDamagedQuantity).sum();

            Map<String, Object> whMap = new HashMap<>();
            whMap.put("id", wh.getId());
            whMap.put("name", wh.getName());
            whMap.put("code", wh.getCode());
            whMap.put("physicalStock", whQty);
            whMap.put("allocatedStock", whAlloc);
            whMap.put("availableStock", whQty - whAlloc);
            whMap.put("damagedStock", whDamaged);
            return whMap;
        }).collect(Collectors.toList());

        metrics.put("warehouseDetails", whDetails);
        return metrics;
    }

    /**
     * Disposition action on quarantined damaged stock (WRITE_OFF, RETURN_TO_VENDOR, REFURBISHED).
     */
    @Transactional
    public Inventory handleDamagedStockAction(Long inventoryId, String action, int qty, String notes) {
        Inventory inv = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found"));

        int currentDamaged = inv.getDamagedQuantity();
        int processQty = qty > 0 ? Math.min(qty, currentDamaged) : currentDamaged;

        if ("WRITE_OFF".equalsIgnoreCase(action) || "SCRAP".equalsIgnoreCase(action) || "RETURN_TO_VENDOR".equalsIgnoreCase(action)) {
            // Deduct from damaged quarantine stock
            inv.setDamagedQuantity(Math.max(0, currentDamaged - processQty));
            inventoryRepository.save(inv);
        } else if ("REFURBISHED".equalsIgnoreCase(action)) {
            // Item repaired: move from damaged quarantine to active sellable stock
            inv.setDamagedQuantity(Math.max(0, currentDamaged - processQty));
            inv.setQuantity(inv.getQuantity() + processQty);
            inventoryRepository.save(inv);
            
            // Sync main stock globally
            if (inv.getProduct() != null) {
                syncProductGlobalStock(inv.getProduct().getId());
            }
        }
        return inv;
    }
}
