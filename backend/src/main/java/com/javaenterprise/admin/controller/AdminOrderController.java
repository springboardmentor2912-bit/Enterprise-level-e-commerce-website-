package com.javaenterprise.admin.controller;

import com.javaenterprise.admin.service.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    // 🆕 1. GET all orders for the Admin dashboard
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllOrders() {
        return ResponseEntity.ok(adminOrderService.getAllOrdersForAdmin());
    }

    // 2. Allocate warehouse to a specific order
    @PutMapping("/{orderId}/allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> allocateWarehouse(
            @PathVariable Long orderId,
            @RequestParam Long warehouseId) {

        adminOrderService.allocateOrderToWarehouse(orderId, warehouseId);
        return ResponseEntity.ok("Order successfully allocated to warehouse");
    }
}