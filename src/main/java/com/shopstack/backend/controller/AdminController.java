package com.shopstack.backend.controller;

import com.shopstack.backend.dto.AdminAnalyticsResponse;
import com.shopstack.backend.dto.AdminDashboardResponse;
import com.shopstack.backend.dto.AdminOrderResponse;
import com.shopstack.backend.dto.AdminVendorResponse;
import com.shopstack.backend.dto.AdminCommissionResponse;
import com.shopstack.backend.service.AdminService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;


    // ==========================================
    // ADMIN DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {

        AdminDashboardResponse response =
                adminService.getDashboardData();

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // VENDOR MANAGEMENT
    // ==========================================

    @GetMapping("/vendors")
    public ResponseEntity<List<AdminVendorResponse>> getAllVendors() {

        List<AdminVendorResponse> vendors =
                adminService.getAllVendors();

        return ResponseEntity.ok(vendors);
    }


    // ==========================================
    // ADMIN ANALYTICS
    // ==========================================

    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {

        AdminAnalyticsResponse response =
                adminService.getAnalyticsData();

        return ResponseEntity.ok(response);
    }


    // ==========================================
    // ORDER MANAGEMENT
    // ==========================================

    @GetMapping("/orders")
    public ResponseEntity<List<AdminOrderResponse>> getAllOrders() {

        List<AdminOrderResponse> orders =
                adminService.getAllOrders();

        return ResponseEntity.ok(orders);
    }


    // ==========================================
    // COMMISSION MANAGEMENT
    // ==========================================

    @GetMapping("/commissions")
    public ResponseEntity<List<AdminCommissionResponse>> getAllCommissions() {

        List<AdminCommissionResponse> commissions =
                adminService.getAllCommissions();

        return ResponseEntity.ok(commissions);
    }


    // ==========================================
    // MARK COMMISSION AS PAID
    // ==========================================

    @PatchMapping("/commissions/{id}/pay")
    public ResponseEntity<?> markCommissionAsPaid(
            @PathVariable Long id) {

        try {

            AdminCommissionResponse response =
                    adminService.markCommissionAsPaid(id);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to mark commission as paid");
        }
    }

}