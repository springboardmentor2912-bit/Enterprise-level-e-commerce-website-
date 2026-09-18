package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.CommissionResponse;
import com.shopstack.shopstack_backend.service.CommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/commissions")
@PreAuthorize("hasRole('ADMIN')")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(
            CommissionService commissionService) {

        this.commissionService =
                commissionService;
    }

    // =========================
    // GET COMMISSION REPORT
    // =========================

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<CommissionResponse>>>
    getCommissionReport() {

        System.out.println(
                "===== ADMIN COMMISSION API HIT ====="
        );

        List<CommissionResponse> response =
                commissionService.getCommissionReport();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Commission Report Retrieved Successfully",
                        response
                )
        );
    }
}