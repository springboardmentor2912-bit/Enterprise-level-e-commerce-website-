package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.entity.OrderStatus;
import com.shopstack.service.AdminDashboardService;
import com.shopstack.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminDashboardService adminDashboardService;
    private final OrderService orderService;

    public AdminController(AdminDashboardService adminDashboardService, OrderService orderService) {
        this.adminDashboardService = adminDashboardService;
        this.orderService = orderService;
    }

    // ─── Dashboard ─────────────────────────────────────────────────────────

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(adminDashboardService.getDashboardStats());
    }

    @GetMapping("/dashboard/vendor-performance")
    public ResponseEntity<List<VendorPerformanceDTO>> getVendorPerformance() {
        return ResponseEntity.ok(adminDashboardService.getVendorPerformance());
    }

    @GetMapping("/dashboard/product-stats")
    public ResponseEntity<ProductOrderStatsDTO> getProductOrderStats() {
        return ResponseEntity.ok(adminDashboardService.getProductOrderStats());
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<SalesReportDTO> getSalesReports() {
        return ResponseEntity.ok(adminDashboardService.getSalesReports());
    }

    @GetMapping("/commissions")
    public ResponseEntity<CommissionSummaryDTO> getCommissionSummary() {
        return ResponseEntity.ok(adminDashboardService.getCommissionSummary());
    }

    @PutMapping("/vendors/{vendorId}/commission-rate")
    public ResponseEntity<VendorCommissionDTO> updateVendorCommissionRate(@PathVariable Long vendorId, @RequestParam BigDecimal rate) {
        return ResponseEntity.ok(adminDashboardService.updateVendorCommissionRate(vendorId, rate));
    }

    // ─── Vendor Management ─────────────────────────────────────────────────

    @GetMapping("/vendors")
    public ResponseEntity<List<VendorPerformanceDTO>> getAllVendors() {
        return ResponseEntity.ok(adminDashboardService.getVendorPerformance());
    }

    @PutMapping("/vendors/{vendorId}/status")
    public ResponseEntity<VendorPerformanceDTO> toggleVendorStatus(
            @PathVariable Long vendorId,
            @RequestParam Boolean active) {
        return ResponseEntity.ok(adminDashboardService.toggleVendorStatus(vendorId, active));
    }

    // ─── Product Visibility ────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllAdminProducts() {
        return ResponseEntity.ok(adminDashboardService.getAllAdminProducts());
    }

    // ─── Order Monitoring ──────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> getAllAdminOrders(
            @RequestParam(required = false) String status) {
        OrderStatus orderStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                orderStatus = OrderStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return ResponseEntity.ok(adminDashboardService.getAllAdminOrders(orderStatus));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body,
            @RequestParam(required = false) String status) {
        String statusStr = status;
        if (statusStr == null && body != null && body.containsKey("status")) {
            statusStr = body.get("status");
        }
        if (statusStr == null) {
            throw new IllegalArgumentException("Order status parameter or body is required.");
        }
        OrderStatus orderStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, orderStatus));
    }

    // ─── System Monitoring ────────────────────────────────────────────────

    @GetMapping("/system/health")
    public ResponseEntity<AdminSystemHealthDTO> getSystemHealth() {
        return ResponseEntity.ok(adminDashboardService.getSystemHealth());
    }

    // ─── Business Reports ─────────────────────────────────────────────────

    @GetMapping("/reports/comprehensive")
    public ResponseEntity<ComprehensiveReportsDTO> getComprehensiveReports() {
        return ResponseEntity.ok(adminDashboardService.getComprehensiveReports());
    }
}
