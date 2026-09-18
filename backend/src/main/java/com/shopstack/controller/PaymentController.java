package com.shopstack.controller;

import com.shopstack.dto.CreatePaymentOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentStatusResponse;
import com.shopstack.dto.VerifyPaymentRequest;
import com.shopstack.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(
            Authentication authentication,
            @RequestBody(required = false) CreatePaymentOrderRequest request) {
        String email = authentication.getName();
        String couponCode = request != null ? request.getCouponCode() : null;
        PaymentOrderResponse response = paymentService.createPaymentOrder(email, couponCode);

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("key", response.getKey());
        resultMap.put("razorpay_order_id", response.getRazorpayOrderId());
        resultMap.put("razorpayOrderId", response.getRazorpayOrderId());
        resultMap.put("amount", response.getAmount());
        resultMap.put("amountInRupees", response.getAmountInRupees());
        resultMap.put("currency", response.getCurrency());

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/verify")
    public ResponseEntity<OrderDTO> verifyAndPlaceOrder(
            Authentication authentication,
            @Valid @RequestBody VerifyPaymentRequest request) {

        String email = authentication.getName();
        OrderDTO order = paymentService.verifyAndPlaceOrder(email, request);
        return ResponseEntity.ok(order);
    }

    /**
     * 4. GET /api/payment/status/{orderId}
     * Returns payment status and order status for a given order ID.
     */
    @GetMapping("/status/{orderId}")
    public ResponseEntity<PaymentStatusResponse> getPaymentStatus(@PathVariable Long orderId) {
        PaymentStatusResponse status = paymentService.getPaymentStatusByOrderId(orderId);
        return ResponseEntity.ok(status);
    }

    /**
     * Optional endpoint to record popup cancellation
     */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancelPayment(
            Authentication authentication,
            @RequestBody Map<String, String> body) {
        String email = authentication.getName();
        String razorpayOrderId = body.get("razorpay_order_id");
        paymentService.recordPaymentCancellation(email, razorpayOrderId);

        Map<String, String> res = new HashMap<>();
        res.put("message", "Payment cancellation recorded.");
        return ResponseEntity.ok(res);
    }
}
