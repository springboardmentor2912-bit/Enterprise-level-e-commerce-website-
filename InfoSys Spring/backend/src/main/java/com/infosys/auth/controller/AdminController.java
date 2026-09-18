package com.infosys.auth.controller;

import com.infosys.auth.model.Order;
import com.infosys.auth.model.User;
import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.service.AdminService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1 & 2: User Management & Platform Overview Stats
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload) {
        String role = payload.get("role");
        return ResponseEntity.ok(adminService.updateUserRole(userId, role));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    // 3: Vendor Management
    @GetMapping("/vendors")
    public ResponseEntity<List<VendorProfile>> getAllVendors() {
        return ResponseEntity.ok(adminService.getAllVendors());
    }

    @GetMapping("/vendors/{vendorId}/details")
    public ResponseEntity<Map<String, Object>> getVendorDetails(@PathVariable Long vendorId) {
        return ResponseEntity.ok(adminService.getVendorDetails(vendorId));
    }

    @PutMapping("/vendors/{vendorId}/status")
    public ResponseEntity<VendorProfile> updateVendorStatus(
            @PathVariable Long vendorId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(adminService.updateVendorStatus(vendorId, status));
    }

    // 4: Marketplace Analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getMarketplaceAnalytics() {
        return ResponseEntity.ok(adminService.getMarketplaceAnalytics());
    }

    // 5: Order Monitoring
    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(adminService.getAllOrders());
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(adminService.updateOrderStatus(orderId, status));
    }

    // 6: Commission Management
    @GetMapping("/commissions")
    public ResponseEntity<Map<String, Object>> getCommissionData() {
        return ResponseEntity.ok(adminService.getCommissionData());
    }

    @PutMapping("/commissions/payout/{vendorId}")
    public ResponseEntity<Map<String, String>> updateVendorPayoutStatus(
            @PathVariable Long vendorId,
            @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PAID");
        return ResponseEntity.ok(adminService.updateVendorPayoutStatus(vendorId, status));
    }

    // 7: System Monitoring
    @GetMapping("/system-status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        return ResponseEntity.ok(adminService.getSystemStatus());
    }

    // 8: Business Reports
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> generateReport(@RequestParam(required = false, defaultValue = "SALES") String type) {
        return ResponseEntity.ok(adminService.generateReport(type));
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReportCsv(@RequestParam(required = false, defaultValue = "SALES") String type) {
        String csvData = adminService.exportReportCsv(type);
        byte[] output = csvData.getBytes();
        String filename = type.toLowerCase() + "_report.csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(output);
    }
}

