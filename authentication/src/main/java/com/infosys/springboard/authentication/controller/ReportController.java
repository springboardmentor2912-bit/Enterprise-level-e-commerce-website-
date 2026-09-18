package com.infosys.springboard.authentication.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.service.ReportService;

@RestController
@RequestMapping("/admin/reports")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // =========================================================
    // DASHBOARD REPORT
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardReport() {

        return ResponseEntity.ok(
                reportService.getDashboardReport()
        );
    }

    // =========================================================
    // ORDER REPORT
    // =========================================================

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getOrderReport() {

        return ResponseEntity.ok(
                reportService.getOrderReport()
        );
    }

    // =========================================================
    // USER REPORT
    // =========================================================

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUserReport() {

        return ResponseEntity.ok(
                reportService.getUserReport()
        );
    }

    // =========================================================
    // PRODUCT REPORT
    // =========================================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProductReport() {

        return ResponseEntity.ok(
                reportService.getProductReport()
        );
    }

    // =========================================================
    // REFUND REPORT
    // =========================================================

    @GetMapping("/refunds")
    public ResponseEntity<Map<String, Object>> getRefundReport() {

        return ResponseEntity.ok(
                reportService.getRefundReport()
        );
    }
}