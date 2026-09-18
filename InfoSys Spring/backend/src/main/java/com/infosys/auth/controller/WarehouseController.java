package com.infosys.auth.controller;

import com.infosys.auth.model.*;
import com.infosys.auth.repository.UserRepository;
import com.infosys.auth.service.ReturnService;
import com.infosys.auth.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/warehouse")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private ReturnService returnService;

    @Autowired
    private UserRepository userRepository;

    // --- Staff, Analytics, Movements & Order Queue Endpoints (Explicit Paths) ---
    @GetMapping("/staff")
    public ResponseEntity<?> getWarehouseStaff() {
        try {
            var staffList = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.WAREHOUSE_STAFF)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(staffList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/staff/{userId:\\d+}/assign")
    public ResponseEntity<?> assignStaffWarehouse(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> body) {
        try {
            Long warehouseId = body.get("warehouseId") != null ? Long.valueOf(body.get("warehouseId").toString()) : null;
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (warehouseId != null && warehouseId > 0) {
                Warehouse wh = warehouseService.getWarehouseById(warehouseId)
                        .orElseThrow(() -> new RuntimeException("Warehouse not found"));
                user.setRole(User.Role.WAREHOUSE_STAFF);
                user.setAssignedWarehouseId(wh.getId());
                user.setAssignedWarehouseName(wh.getName());
            } else {
                user.setAssignedWarehouseId(null);
                user.setAssignedWarehouseName(null);
            }
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Staff assigned successfully", "user", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getWarehouseAnalytics() {
        return ResponseEntity.ok(warehouseService.getWarehouseAnalytics());
    }

    @GetMapping("/movements")
    public ResponseEntity<List<StockMovement>> getStockMovements(@RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(warehouseService.getWarehouseStockMovements(warehouseId));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getStaffOrderQueue(@RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(warehouseService.getStaffOrderQueue(warehouseId));
    }

    @GetMapping("/orders/active")
    public ResponseEntity<List<Order>> getActiveStaffOrders(@RequestParam(required = false) Long warehouseId) {
        return ResponseEntity.ok(warehouseService.getActiveStaffOrders(warehouseId));
    }

    // --- Warehouse Management Endpoints ---
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        return warehouseService.getWarehouseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.createWarehouse(warehouse));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, warehouse));
    }

    // --- Warehouse Inventory Endpoints ---
    @GetMapping("/{id:\\d+}/inventory")
    public ResponseEntity<List<WarehouseInventory>> getWarehouseInventory(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseInventory(id));
    }

    @PostMapping("/{id:\\d+}/inward")
    public ResponseEntity<?> inwardStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long productId = Long.valueOf(body.get("productId").toString());
            Integer quantity = Integer.valueOf(body.get("quantity").toString());
            Long staffId = body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body.get("staffName") != null ? body.get("staffName").toString() : "Warehouse Staff";
            String aisleBin = body.get("aisleBin") != null ? body.get("aisleBin").toString() : null;
            String note = body.get("note") != null ? body.get("note").toString() : "Stock replenishment";

            WarehouseInventory inv = warehouseService.inwardStock(id, productId, quantity, staffId, staffName, aisleBin, note);
            return ResponseEntity.ok(inv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id:\\d+}/adjust")
    public ResponseEntity<?> adjustStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            Long productId = Long.valueOf(body.get("productId").toString());
            Integer newQuantity = Integer.valueOf(body.get("quantity").toString());
            String reason = body.get("reason") != null ? body.get("reason").toString() : "Routine Audit";
            Long staffId = body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body.get("staffName") != null ? body.get("staffName").toString() : "Warehouse Staff";

            WarehouseInventory inv = warehouseService.adjustStock(id, productId, newQuantity, reason, staffId, staffName);
            return ResponseEntity.ok(inv);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Pick, Pack, Ship, Deliver Actions ---
    @PutMapping("/orders/{orderId}/pick")
    public ResponseEntity<?> pickOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Long staffId = body != null && body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body != null && body.get("staffName") != null ? body.get("staffName").toString() : "Warehouse Staff";
            Order order = warehouseService.pickOrder(orderId, staffId, staffName);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/pack")
    public ResponseEntity<?> packOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Long staffId = body != null && body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body != null && body.get("staffName") != null ? body.get("staffName").toString() : "Warehouse Staff";
            String note = body != null && body.get("note") != null ? body.get("note").toString() : "Box Standard Size";
            Order order = warehouseService.packOrder(orderId, staffId, staffName, note);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/ship")
    public ResponseEntity<?> prepareShipment(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            String carrier = body != null && body.get("carrier") != null ? body.get("carrier").toString() : "BlueDart Express";
            String trackingNumber = body != null && body.get("trackingNumber") != null ? body.get("trackingNumber").toString() : "TRK-" + System.currentTimeMillis();
            Long staffId = body != null && body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body != null && body.get("staffName") != null ? body.get("staffName").toString() : "Warehouse Staff";

            Order order = warehouseService.prepareShipment(orderId, carrier, trackingNumber, staffId, staffName);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/orders/{orderId}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable Long orderId) {
        try {
            Order order = warehouseService.deliverOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- Return & Refund Endpoints ---
    @GetMapping("/returns")
    public ResponseEntity<List<ReturnRequest>> getAllReturns(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long userId) {
        if (userId != null && userId > 0) {
            return ResponseEntity.ok(returnService.getUserReturnRequests(userId));
        }
        if (warehouseId != null && warehouseId > 0) {
            return ResponseEntity.ok(returnService.getWarehouseReturnRequests(warehouseId));
        }
        return ResponseEntity.ok(returnService.getAllReturnRequests());
    }

    @PostMapping("/returns")
    public ResponseEntity<?> createReturnRequest(@RequestBody Map<String, Object> body) {
        try {
            Long orderId = Long.valueOf(body.get("orderId").toString());
            Long userId = Long.valueOf(body.get("userId").toString());
            String reason = body.get("reason") != null ? body.get("reason").toString() : "Product return requested";

            ReturnRequest req = returnService.createReturnRequest(orderId, userId, reason);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/returns/{id}/status")
    public ResponseEntity<?> updateReturnStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            String status = body.get("status").toString();
            String rejectionReason = body.get("rejectionReason") != null ? body.get("rejectionReason").toString() : null;
            ReturnRequest req = returnService.updateReturnStatus(id, status, rejectionReason);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/returns/{id}/qc")
    public ResponseEntity<?> performQcInspection(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        try {
            boolean passed = Boolean.parseBoolean(body.get("passed").toString());
            String remarks = body.get("remarks") != null ? body.get("remarks").toString() : "QC Inspection completed";
            Long staffId = body.get("staffId") != null ? Long.valueOf(body.get("staffId").toString()) : 1L;
            String staffName = body.get("staffName") != null ? body.get("staffName").toString() : "QC Staff";

            ReturnRequest req = returnService.performQcInspection(id, passed, remarks, staffId, staffName);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
