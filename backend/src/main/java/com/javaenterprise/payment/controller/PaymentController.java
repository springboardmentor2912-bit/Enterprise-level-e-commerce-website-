package com.javaenterprise.payment.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.payment.dto.PaymentResponse;
import com.javaenterprise.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    @GetMapping("/history")
    public ResponseEntity<List<PaymentResponse>> getPaymentHistory(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getUserPayments(authentication));
    }


    //new
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestParam(required = false) String couponCode,
                                             Authentication authentication) {
        return ResponseEntity.ok(paymentService.initiatePayment(authentication, couponCode));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> payload,
                                           @RequestParam Long addressId,
                                           @RequestParam(required = false) String couponCode,
                                           Authentication authentication) {
        try {
            OrderResponse order = paymentService.verifyAndProcessPayment(payload, authentication, addressId, couponCode);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "status", "FAILED"));
        }
    }

    @PostMapping("/cod")
    public ResponseEntity<?> placeCodOrder(@RequestParam Long addressId,
                                           @RequestParam(required = false) String couponCode,
                                           Authentication authentication) {
        try {
            return ResponseEntity.ok(paymentService.placeCodOrder(addressId, couponCode, authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "status", "FAILED"));
        }
    }
}