package com.shopstack.shopstack_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shopstack.shopstack_backend.dto.AdminAnalyticsResponse;
import com.shopstack.shopstack_backend.dto.AdminDashboardResponse;
import com.shopstack.shopstack_backend.dto.AdminVendorDetailsResponse;
import com.shopstack.shopstack_backend.dto.CommissionDTO;
import com.shopstack.shopstack_backend.dto.SystemMonitoringDTO;
import com.shopstack.shopstack_backend.dto.VendorResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.ProductStatus;
import com.shopstack.shopstack_backend.entity.VendorStatus;
import com.shopstack.shopstack_backend.service.AdminService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboard() {

        return adminService.getDashboardData();
    }


    // =========================================================
    // ALL VENDORS
    // =========================================================

    @GetMapping("/vendors")
    public List<VendorResponse> getVendors() {

        return adminService.getVendors();
    }


    // =========================================================
    // ALL ORDERS
    // =========================================================

    @GetMapping("/orders")
    public List<Order> getAllOrders() {

        return adminService.getAllOrders();
    }


    // =========================================================
    // VENDOR DETAILS
    // =========================================================

    @GetMapping("/vendors/{id}")
    public AdminVendorDetailsResponse getVendorDetails(
            @PathVariable Long id
    ) {

        return adminService.getVendorDetails(id);
    }


    // =========================================================
    // UPDATE VENDOR STATUS
    // =========================================================

    @PutMapping("/vendors/{id}/status")
    public AdminVendorDetailsResponse updateVendorStatus(
            @PathVariable Long id,
            @RequestParam VendorStatus status
    ) {

        return adminService.updateVendorStatus(id, status);
    }


    // =========================================================
    // ADMIN - VENDOR PRODUCTS
    // =========================================================

    @GetMapping("/vendors/{id}/products")
    public ResponseEntity<List<Product>> getVendorProducts(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                adminService.getProductsByVendorForAdmin(id)
        );
    }


    // =========================================================
    // ADMIN - UPDATE PRODUCT STATUS
    // =========================================================

    @PutMapping("/products/{id}/status")
    public ResponseEntity<Product> updateProductStatus(
            @PathVariable Long id,
            @RequestParam ProductStatus status
    ) {

        return ResponseEntity.ok(
                adminService.updateProductStatus(id, status)
        );
    }


    // =========================================================
    // ANALYTICS
    // =========================================================

    @GetMapping("/analytics")
    public AdminAnalyticsResponse getAnalytics() {

        return adminService.getAnalytics();
    }


    // =========================================================
    // COMMISSIONS
    // =========================================================

    @GetMapping("/commissions")
    public ResponseEntity<List<CommissionDTO>> getCommissionDetails() {

        return ResponseEntity.ok(
                adminService.getCommissionDetails()
        );
    }


    // =========================================================
    // SYSTEM MONITORING
    // =========================================================

    @GetMapping("/system-monitoring")
    public ResponseEntity<SystemMonitoringDTO> getSystemMonitoring() {

        return ResponseEntity.ok(
                adminService.getSystemMonitoring()
        );
    }
}