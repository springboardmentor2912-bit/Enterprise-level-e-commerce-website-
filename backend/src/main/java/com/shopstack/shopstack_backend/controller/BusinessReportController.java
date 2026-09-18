package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.BusinessReportResponse;
import com.shopstack.shopstack_backend.service.BusinessReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class BusinessReportController {

    private final BusinessReportService businessReportService;

    public BusinessReportController(
            BusinessReportService businessReportService) {

        this.businessReportService =
                businessReportService;
    }

    // =========================
    // BUSINESS REPORT
    // =========================

    @GetMapping("/business")
    public ResponseEntity<
            ApiResponse<BusinessReportResponse>>
    getBusinessReport() {

        System.out.println(
                "===== BUSINESS REPORT API HIT ====="
        );

        BusinessReportResponse response =
                businessReportService.getBusinessReport();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Business Report Retrieved Successfully",
                        response
                )
        );
    }
}