package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.RefundRequest;
import com.infosys.springboard.authentication.entity.Refund;
import com.infosys.springboard.authentication.service.RefundService;

@RestController
@RequestMapping("/customer/refunds")
@PreAuthorize("hasRole('CUSTOMER')")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    // =========================================================
    // CUSTOMER - CREATE REFUND
    // =========================================================

    @PostMapping
    public ResponseEntity<Refund> createRefund(
            @RequestBody RefundRequest request) {

        return ResponseEntity.ok(
                refundService.createRefund(request));
    }

    // =========================================================
    // CUSTOMER - GET OWN REFUNDS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Refund>> getCustomerRefunds(
            @RequestParam String email) {

        return ResponseEntity.ok(
                refundService.getRefundsByCustomer(email));
    }

    // =========================================================
    // CUSTOMER - GET REFUND BY ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Refund> getRefundByOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                refundService.getRefundByOrderId(orderId));
    }
}