package com.javaenterprise.admin.controller;

import com.javaenterprise.admin.dto.AdminDashboardResponse;
import com.javaenterprise.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public AdminDashboardResponse dashboard() {
        return dashboardService.dashboard();
    }
}