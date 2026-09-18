package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.AdminDashboardResponse;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(
            AdminDashboardService adminDashboardService) {

        this.adminDashboardService =
                adminDashboardService;
    }

    // =========================
    // ADMIN DASHBOARD
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>>
    getDashboard() {

        System.out.println(
                "===== ADMIN DASHBOARD API HIT ====="
        );

        AdminDashboardResponse response =
                adminDashboardService.getDashboard();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Admin Dashboard Retrieved Successfully",
                        response
                )
        );
    }
}