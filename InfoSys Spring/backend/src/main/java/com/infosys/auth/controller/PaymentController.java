package com.infosys.auth.controller;

import com.infosys.auth.dto.RazorpayOrderRequest;
import com.infosys.auth.dto.RazorpayOrderResponse;
import com.infosys.auth.dto.RazorpayPaymentVerifyRequest;
import com.infosys.auth.model.Order;
import com.infosys.auth.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/key")
    public ResponseEntity<Map<String, String>> getRazorpayKey() {
        return ResponseEntity.ok(Map.of(
                "keyId", paymentService.getKeyId(),
                "mode", "TEST"
        ));
    }

    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(@RequestBody RazorpayOrderRequest request) {
        RazorpayOrderResponse response = paymentService.createRazorpayOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<Order> verifyPayment(@RequestBody RazorpayPaymentVerifyRequest verifyRequest) {
        Order updatedOrder = paymentService.verifyPayment(verifyRequest);
        return ResponseEntity.ok(updatedOrder);
    }
}
