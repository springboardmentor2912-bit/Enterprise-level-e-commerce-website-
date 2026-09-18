package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.entity.Commission;
import com.infosys.springboard.authentication.service.CommissionService;

@RestController
@RequestMapping("/admin/commissions")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminCommissionController {

    private final CommissionService commissionService;

    public AdminCommissionController(
            CommissionService commissionService) {

        this.commissionService = commissionService;
    }

    // Get all commission records
    @GetMapping
    public ResponseEntity<List<Commission>> getAllCommissions() {

        return ResponseEntity.ok(
                commissionService.getAllCommissions()
        );
    }

    // Get commissions for a particular order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Commission>> getOrderCommissions(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                commissionService.getOrderCommissions(orderId)
        );
    }

    // Get commissions of a particular vendor
    @GetMapping("/vendor/{vendorEmail}")
    public ResponseEntity<List<Commission>> getVendorCommissions(
            @PathVariable String vendorEmail) {

        return ResponseEntity.ok(
                commissionService.getVendorCommissions(vendorEmail)
        );
    }
}