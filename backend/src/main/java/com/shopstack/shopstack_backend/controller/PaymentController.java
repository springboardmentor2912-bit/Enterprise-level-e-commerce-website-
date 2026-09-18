package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.PaymentRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.PaymentResponse;
import com.shopstack.shopstack_backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(
            PaymentService paymentService) {

        this.paymentService = paymentService;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>>
    createPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment Created Successfully",
                        response
                )
        );
    }

    // =========================================================
    // GET PAYMENT BY ORDER
    // =========================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>>
    getPaymentByOrderId(
            @PathVariable Long orderId) {

        PaymentResponse response =
                paymentService.getPaymentByOrderId(
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment Retrieved Successfully",
                        response
                )
        );
    }

    // =========================================================
    // VERIFY PAYMENT
    // =========================================================

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>>
    verifyPayment(
            @PathVariable Long paymentId,
            @RequestParam String paymentOrderId,
            @RequestParam String paymentReference,
            @RequestParam String signature) {

        PaymentResponse response =
                paymentService.verifyPayment(
                        paymentId,
                        paymentOrderId,
                        paymentReference,
                        signature
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment Verified Successfully",
                        response
                )
        );
    }

    // =========================================================
    // ADMIN PAYMENT STATUS
    // =========================================================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{paymentId}/status")
    public ResponseEntity<ApiResponse<PaymentResponse>>
    updatePaymentStatus(
            @PathVariable Long paymentId,
            @RequestParam String status) {

        PaymentResponse response =
                paymentService.updatePaymentStatus(
                        paymentId,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Payment Status Updated Successfully",
                        response
                )
        );
    }
}