package com.shopstack.backend.controller;

import com.shopstack.backend.model.Inventory;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Warehouse;
import com.shopstack.backend.model.WarehouseAllocation;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.repository.InventoryRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.WarehouseAllocationRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/warehouses")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class WarehouseController {

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
    private WarehouseService warehouseService;

    // --- WAREHOUSE CRUD ---

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        return warehouseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseRepository.save(warehouse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody Warehouse details) {
        return warehouseRepository.findById(id).map(warehouse -> {
            warehouse.setName(details.getName());
            warehouse.setCode(details.getCode());
            warehouse.setAddress(details.getAddress());
            warehouse.setCity(details.getCity());
            warehouse.setActive(details.isActive());
            return ResponseEntity.ok(warehouseRepository.save(warehouse));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        return warehouseRepository.findById(id).map(warehouse -> {
            warehouseRepository.delete(warehouse);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- INVENTORY MANAGEMENT ---

    @GetMapping("/inventory/all")
    public ResponseEntity<?> getAllInventories() {
        List<Inventory> inventories = inventoryRepository.findAll();
        List<Map<String, Object>> response = inventories.stream().map(inv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("warehouseId", inv.getWarehouse() != null ? inv.getWarehouse().getId() : null);
            map.put("warehouseName", inv.getWarehouse() != null ? inv.getWarehouse().getName() : "Unknown Warehouse");
            map.put("warehouseCode", inv.getWarehouse() != null ? inv.getWarehouse().getCode() : "N/A");
            map.put("productId", inv.getProduct() != null ? inv.getProduct().getId() : null);
            map.put("productName", inv.getProduct() != null ? inv.getProduct().getName() : "Unknown Product");
            map.put("productCategory", inv.getProduct() != null ? inv.getProduct().getCategory() : "General");
            map.put("productPrice", inv.getProduct() != null ? inv.getProduct().getPrice() : 0.0);
            map.put("productImageUrl", inv.getProduct() != null ? inv.getProduct().getImageUrl() : "");
            map.put("quantity", inv.getQuantity());
            map.put("allocated", inv.getAllocated());
            map.put("available", inv.getAvailableQuantity());
            map.put("damagedQuantity", inv.getDamagedQuantity());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/damaged-stock")
    public ResponseEntity<?> getDamagedStock() {
        List<Inventory> inventories = inventoryRepository.findAll();
        List<Map<String, Object>> response = inventories.stream()
                .filter(inv -> inv.getDamagedQuantity() > 0)
                .map(inv -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", inv.getId());
                    map.put("warehouseId", inv.getWarehouse() != null ? inv.getWarehouse().getId() : null);
                    map.put("warehouseName", inv.getWarehouse() != null ? inv.getWarehouse().getName() : "Unknown Warehouse");
                    map.put("warehouseCode", inv.getWarehouse() != null ? inv.getWarehouse().getCode() : "N/A");
                    map.put("warehouseLocation", inv.getWarehouse() != null ? inv.getWarehouse().getCity() : "N/A");
                    map.put("productId", inv.getProduct() != null ? inv.getProduct().getId() : null);
                    map.put("productName", inv.getProduct() != null ? inv.getProduct().getName() : "Unknown Product");
                    map.put("productCategory", inv.getProduct() != null ? inv.getProduct().getCategory() : "General");
                    double price = inv.getProduct() != null ? inv.getProduct().getPrice() : 0.0;
                    map.put("productPrice", price);
                    map.put("productImageUrl", inv.getProduct() != null ? inv.getProduct().getImageUrl() : "");
                    map.put("damagedQuantity", inv.getDamagedQuantity());
                    map.put("totalDamagedValue", Math.round(inv.getDamagedQuantity() * price * 100.0) / 100.0);
                    return map;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/damaged-stock/{inventoryId}/action")
    public ResponseEntity<?> handleDamagedAction(@PathVariable Long inventoryId, @RequestBody Map<String, Object> payload) {
        String action = payload.getOrDefault("action", "WRITE_OFF").toString();
        int qty = payload.containsKey("quantity") ? Integer.parseInt(payload.get("quantity").toString()) : 0;
        String notes = payload.getOrDefault("notes", "").toString();

        try {
            Inventory updated = warehouseService.handleDamagedStockAction(inventoryId, action, qty, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<Inventory>> getWarehouseInventory(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryRepository.findByWarehouseId(id));
    }

    @PostMapping("/{id}/inventory")
    public ResponseEntity<?> addOrUpdateInventory(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        Optional<Warehouse> whOpt = warehouseRepository.findById(id);
        if (whOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Warehouse not found");
        }

        if (!payload.containsKey("productId") || !payload.containsKey("quantity")) {
            return ResponseEntity.badRequest().body("productId and quantity are required");
        }

        Long productId = Long.parseLong(payload.get("productId").toString());
        int qty = Integer.parseInt(payload.get("quantity").toString());

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Product not found");
        }

        Inventory inventory = inventoryRepository.findByWarehouseIdAndProductId(id, productId)
                .map(inv -> {
                    inv.setQuantity(inv.getQuantity() + qty);
                    return inventoryRepository.save(inv);
                })
                .orElseGet(() -> {
                    Inventory inv = new Inventory(whOpt.get(), prodOpt.get(), qty);
                    return inventoryRepository.save(inv);
                });

        warehouseService.syncProductGlobalStock(productId);
        return ResponseEntity.ok(inventory);
    }

    @PutMapping("/inventory/{invId}")
    public ResponseEntity<?> updateInventoryDirectly(@PathVariable Long invId, @RequestBody Map<String, Object> payload) {
        return inventoryRepository.findById(invId).map(inv -> {
            if (payload.containsKey("quantity")) {
                inv.setQuantity(Integer.parseInt(payload.get("quantity").toString()));
            }
            if (payload.containsKey("allocated")) {
                inv.setAllocated(Integer.parseInt(payload.get("allocated").toString()));
            }
            Inventory saved = inventoryRepository.save(inv);
            warehouseService.syncProductGlobalStock(inv.getProduct().getId());
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/distribute-stock")
    public ResponseEntity<?> distributeStock(@RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("productId") || !payload.containsKey("distributions")) {
            return ResponseEntity.badRequest().body("productId and distributions are required");
        }
        try {
            Long productId = Long.parseLong(payload.get("productId").toString());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> distributions = (List<Map<String, Object>>) payload.get("distributions");
            List<Inventory> updated = warehouseService.distributeProductStock(productId, distributions);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to distribute stock: " + e.getMessage());
        }
    }

    // --- ALLOCATION WORKFLOW ---

    @GetMapping("/allocations")
    public ResponseEntity<?> getAllAllocations() {
        List<WarehouseAllocation> allocations = allocationRepository.findAll();
        List<Map<String, Object>> response = allocations.stream().map(alloc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", alloc.getId());
            map.put("orderId", alloc.getOrderId());
            map.put("orderItemId", alloc.getOrderItemId());
            map.put("productId", alloc.getProductId());
            
            // Fetch product name
            String prodName = "Unknown Product";
            Optional<Product> p = productRepository.findById(alloc.getProductId());
            if (p.isPresent()) {
                prodName = p.get().getName();
            }
            map.put("productName", prodName);

            if (alloc.getWarehouse() != null) {
                map.put("warehouseId", alloc.getWarehouse().getId());
                map.put("warehouseName", alloc.getWarehouse().getName());
                map.put("warehouseCode", alloc.getWarehouse().getCode());
            } else {
                map.put("warehouseId", null);
                map.put("warehouseName", "UNALLOCATED - Stock Pending");
                map.put("warehouseCode", "N/A");
            }

            map.put("quantity", alloc.getQuantity());
            map.put("status", alloc.getStatus());
            map.put("updatedAt", alloc.getUpdatedAt() != null ? alloc.getUpdatedAt().toString() : null);
            map.put("courierPartner", alloc.getCourierPartner());
            map.put("trackingNumber", alloc.getTrackingNumber());
            map.put("packagingType", alloc.getPackagingType());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/allocations/allocate/{orderId}")
    public ResponseEntity<?> autoAllocateOrder(@PathVariable String orderId) {
        try {
            List<WarehouseAllocation> allocations = warehouseService.allocateOrder(orderId);
            return ResponseEntity.ok(allocations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Allocation failed: " + e.getMessage());
        }
    }

    @PostMapping("/orders/{orderId}/allocate-warehouse")
    public ResponseEntity<?> allocateOrderToWarehouse(@PathVariable String orderId, @RequestBody Map<String, Object> payload) {
        if (!payload.containsKey("warehouseId")) {
            return ResponseEntity.badRequest().body("warehouseId is required");
        }
        try {
            Long warehouseId = Long.parseLong(payload.get("warehouseId").toString());
            List<WarehouseAllocation> allocations = warehouseService.allocateEntireOrderToWarehouse(orderId, warehouseId);
            return ResponseEntity.ok(allocations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Allocation failed: " + e.getMessage());
        }
    }

    @PostMapping("/allocations/manual")
    public ResponseEntity<?> manualAllocateStock(@RequestBody Map<String, Object> payload) {
        try {
            String orderId = payload.get("orderId").toString();
            Long orderItemId = Long.parseLong(payload.get("orderItemId").toString());
            Long warehouseId = Long.parseLong(payload.get("warehouseId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());

            // Delete any existing unallocated or partially allocated records for this order item to replace them
            List<WarehouseAllocation> existing = allocationRepository.findByOrderId(orderId).stream()
                    .filter(a -> a.getOrderItemId().equals(orderItemId))
                    .collect(Collectors.toList());
            
            // Adjust allocations back
            for (WarehouseAllocation old : existing) {
                if (old.getWarehouse() != null && !"READY_FOR_SHIPMENT".equals(old.getStatus())) {
                    Optional<Inventory> inv = inventoryRepository.findByWarehouseIdAndProductId(
                            old.getWarehouse().getId(), old.getProductId()
                    );
                    if (inv.isPresent()) {
                        inv.get().setQuantity(inv.get().getQuantity() + old.getQuantity());
                        inventoryRepository.save(inv.get());
                    }
                }
                allocationRepository.delete(old);
            }

            WarehouseAllocation alloc = warehouseService.manualAllocate(orderId, orderItemId, warehouseId, quantity);
            return ResponseEntity.ok(alloc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Manual allocation failed: " + e.getMessage());
        }
    }

    @PutMapping("/allocations/{id}/status")
    public ResponseEntity<?> updateAllocationStatus(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String status = payload.get("status").toString();
            WarehouseAllocation alloc = warehouseService.updateFulfillmentStatus(id, status, payload);
            return ResponseEntity.ok(alloc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update status: " + e.getMessage());
        }
    }

    // --- ANALYTICS ---

    @GetMapping("/analytics")
    public ResponseEntity<?> getWarehouseAnalytics() {
        return ResponseEntity.ok(warehouseService.getAnalytics());
    }
}
