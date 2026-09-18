package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.entity.Refund;
import com.infosys.springboard.authentication.service.RefundService;

@RestController
@RequestMapping("/admin/refunds")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminRefundController {

    private final RefundService refundService;

    public AdminRefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    // =========================================================
    // ADMIN - GET ALL REFUNDS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Refund>> getAllRefunds() {

        return ResponseEntity.ok(
                refundService.getAllRefunds());
    }

    // =========================================================
    // ADMIN - GET REFUND BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Refund> getRefundById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                refundService.getRefundById(id));
    }

    // =========================================================
    // ADMIN - GET REFUNDS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Refund>> getRefundsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                refundService.getRefundsByStatus(status));
    }

    // =========================================================
    // ADMIN - APPROVE REFUND
    // =========================================================

    @PutMapping("/{id}/approve")
    public ResponseEntity<Refund> approveRefund(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                refundService.approveRefund(id, remarks));
    }

    // =========================================================
    // ADMIN - REJECT REFUND
    // =========================================================

    @PutMapping("/{id}/reject")
    public ResponseEntity<Refund> rejectRefund(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                refundService.rejectRefund(id, remarks));
    }

    // =========================================================
    // ADMIN - COMPLETE REFUND
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<Refund> completeRefund(
            @PathVariable Long id,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                refundService.completeRefund(id, remarks));
    }
}