package com.infosys.auth.controller;

import com.infosys.auth.model.VendorCommission;
import com.infosys.auth.service.CommissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;

    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCommissionSummary() {
        return ResponseEntity.ok(commissionService.getCommissionSummary());
    }

    @GetMapping("/records")
    public ResponseEntity<List<VendorCommission>> getAllCommissions() {
        return ResponseEntity.ok(commissionService.getAllCommissions());
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<VendorCommission>> getCommissionsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(commissionService.getCommissionsByVendor(vendorId));
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateCommission(@RequestBody Map<String, Object> payload) {
        BigDecimal orderAmount = BigDecimal.ZERO;
        BigDecimal commissionRate = commissionService.getDefaultCommissionRate();

        if (payload.containsKey("orderAmount") && payload.get("orderAmount") != null) {
            orderAmount = new BigDecimal(payload.get("orderAmount").toString());
        }
        if (payload.containsKey("commissionRate") && payload.get("commissionRate") != null) {
            commissionRate = new BigDecimal(payload.get("commissionRate").toString());
        }

        Map<String, Object> calculation = commissionService.calculateCommission(orderAmount, commissionRate);
        return ResponseEntity.ok(calculation);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<VendorCommission> updateCommissionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PAID");
        return ResponseEntity.ok(commissionService.updateCommissionStatus(id, status));
    }

    @PutMapping("/payout/{vendorId}")
    public ResponseEntity<Map<String, String>> updateVendorPayoutStatus(
            @PathVariable Long vendorId,
            @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "PAID");
        return ResponseEntity.ok(commissionService.updateVendorPayoutStatus(vendorId, status));
    }

    @PutMapping("/rate")
    public ResponseEntity<Map<String, Object>> updateDefaultCommissionRate(@RequestBody Map<String, Object> payload) {
        if (payload.containsKey("rate") && payload.get("rate") != null) {
            BigDecimal rate = new BigDecimal(payload.get("rate").toString());
            commissionService.setDefaultCommissionRate(rate);
        }
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "defaultCommissionRate", commissionService.getDefaultCommissionRate()
        ));
    }
}
