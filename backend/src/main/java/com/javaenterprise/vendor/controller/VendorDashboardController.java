package com.javaenterprise.vendor.controller;

import com.javaenterprise.vendor.dto.VendorDashboardResponse;
import com.javaenterprise.vendor.service.VendorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/dashboard")
@RequiredArgsConstructor
public class VendorDashboardController {

    private final VendorDashboardService dashboardService;

    @GetMapping
    public VendorDashboardResponse dashboard(
            Authentication authentication) {

        return dashboardService.getDashboard(authentication);
    }
}