package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.model.Order;
import com.shopstack.model.OrderStatus;
import com.shopstack.model.User;
import com.shopstack.model.VendorProfile;
import com.shopstack.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. Dashboard System Summary KPIs
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    // 2. Marketplace Analytics with Date Range
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics(@RequestParam(required = false, defaultValue = "30D") String range) {
        return ResponseEntity.ok(adminService.getAnalytics(range));
    }

    // 3. Vendor Governance & Metrics
    @GetMapping("/vendors")
    public ResponseEntity<List<AdminVendorMetricResponse>> getVendorsWithMetrics() {
        return ResponseEntity.ok(adminService.getVendorsWithMetrics());
    }

    @PutMapping("/vendors/{vendorId}/commission")
    public ResponseEntity<VendorProfile> updateVendorCommission(
            @PathVariable Long vendorId,
            @RequestBody Map<String, Double> payload) {
        Double commissionRate = payload.get("commissionRate");
        return ResponseEntity.ok(adminService.updateVendorCommission(vendorId, commissionRate));
    }

    // 4. Global Order Monitoring
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(adminService.getAllOrders(search, status));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(adminService.updateOrderStatus(orderId, status));
    }

    // 5. Commission Management & Payouts
    @GetMapping("/commissions")
    public ResponseEntity<AdminCommissionSummary> getCommissionSummary() {
        return ResponseEntity.ok(adminService.getCommissionSummary());
    }

    // 6. System Health & JVM Metrics Monitoring
    @GetMapping("/system/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        return ResponseEntity.ok(adminService.getSystemHealth());
    }

    // 7. Business Reports Engine
    @GetMapping("/reports")
    public ResponseEntity<BusinessReportResponse> getBusinessReport(
            @RequestParam(required = false, defaultValue = "SALES") String type,
            @RequestParam(required = false, defaultValue = "ALL") String range) {
        return ResponseEntity.ok(adminService.generateBusinessReport(type, range));
    }

    // 8. User Role Governance
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.toggleUserStatus(userId));
    }
}
