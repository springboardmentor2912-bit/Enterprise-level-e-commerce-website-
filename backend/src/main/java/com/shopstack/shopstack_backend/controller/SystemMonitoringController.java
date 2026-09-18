package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.SystemMonitoringResponse;
import com.shopstack.shopstack_backend.service.SystemMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system")
@PreAuthorize("hasRole('ADMIN')")
public class SystemMonitoringController {

    private final SystemMonitoringService systemMonitoringService;

    public SystemMonitoringController(
            SystemMonitoringService systemMonitoringService) {

        this.systemMonitoringService =
                systemMonitoringService;
    }

    // =========================
    // SYSTEM MONITORING
    // =========================

    @GetMapping("/status")
    public ResponseEntity<
            ApiResponse<SystemMonitoringResponse>>
    getSystemStatus() {

        System.out.println(
                "===== SYSTEM MONITORING API HIT ====="
        );

        SystemMonitoringResponse response =
                systemMonitoringService.getSystemStatus();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "System Status Retrieved Successfully",
                        response
                )
        );
    }
}