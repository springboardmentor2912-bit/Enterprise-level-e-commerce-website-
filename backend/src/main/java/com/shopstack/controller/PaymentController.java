package com.shopstack.controller;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentVerificationRequest;
import com.shopstack.model.Payment;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        PaymentOrderResponse response = paymentService.createPaymentOrder(principal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Payment> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {
        Payment payment = paymentService.verifyAndProcessPayment(request);
        return ResponseEntity.ok(payment);
    }

    @PostMapping("/failure")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Payment> handleFailure(
            @RequestParam String razorpayOrderId,
            @RequestParam(required = false) String reason) {
        Payment payment = paymentService.handlePaymentFailure(razorpayOrderId, reason);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/my-payments")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getCustomerPayments(principal.getId()));
    }
}
