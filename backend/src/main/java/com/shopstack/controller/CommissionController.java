package com.shopstack.controller;

import com.shopstack.dto.AdminCommissionSummary;
import com.shopstack.dto.CommissionCalculationRequest;
import com.shopstack.dto.CommissionCalculationResponse;
import com.shopstack.dto.CommissionResponse;
import com.shopstack.model.CommissionStatus;
import com.shopstack.service.CommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    /**
     * Commission calculation simulator API.
     * Accessible for testing different order amounts and commission rates in real-time.
     */
    @PostMapping("/calculate")
    public ResponseEntity<CommissionCalculationResponse> calculateCommission(@RequestBody CommissionCalculationRequest request) {
        CommissionCalculationResponse response = commissionService.simulateCommission(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get overall marketplace commission summary.
     */
    @GetMapping("/summary")
    public ResponseEntity<AdminCommissionSummary> getCommissionSummary() {
        return ResponseEntity.ok(commissionService.getCommissionSummary());
    }

    /**
     * Admin: Retrieve all commission audit records with optional vendor and status filters.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommissionResponse>> getAllCommissions(
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) CommissionStatus status) {
        return ResponseEntity.ok(commissionService.getAllCommissions(vendorId, status));
    }

    /**
     * Retrieve commission records for a specific vendor.
     */
    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<List<CommissionResponse>> getCommissionsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(commissionService.getCommissionsByVendor(vendorId));
    }

    /**
     * Retrieve commission record for a specific order.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<CommissionResponse> getCommissionByOrderId(@PathVariable Long orderId) {
        return commissionService.getCommissionByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Admin: Update commission settlement / payout status.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommissionResponse> updateCommissionStatus(
            @PathVariable Long id,
            @RequestParam CommissionStatus status) {
        return ResponseEntity.ok(commissionService.updateCommissionStatus(id, status));
    }
}
