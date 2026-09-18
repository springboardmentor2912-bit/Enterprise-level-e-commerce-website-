package com.infosys.springboard.authentication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.dto.PaymentRequest;
import com.infosys.springboard.authentication.dto.PaymentResponse;
import com.infosys.springboard.authentication.service.OrderService;
import com.infosys.springboard.authentication.service.PaymentService;
import com.infosys.springboard.authentication.service.RazorpayService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/customer/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    private final OrderService orderService;

    public PaymentController(
            PaymentService paymentService,
            RazorpayService razorpayService,
            OrderService orderService) {

        this.paymentService = paymentService;
        this.razorpayService = razorpayService;
        this.orderService = orderService;
    }

    // =========================================================
    // PROCESS PAYMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {

        String customerEmail = authentication.getName();

        PaymentResponse response =
                paymentService.processPayment(
                        request,
                        customerEmail
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @RequestBody RazorpayCreateOrderRequest request,
            Authentication authentication) {

        if (request == null || request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }

        String customerEmail = authentication.getName();

        /*
         * Get the existing ShopStack order.
         *
         * The amount is always taken from the backend order.
         * We never trust the amount sent by React.
         */
        OrderResponse shopStackOrder =
                orderService.getCustomerOrderById(
                        request.getOrderId(),
                        customerEmail
                );

        if (shopStackOrder == null) {
            throw new RuntimeException("Order not found");
        }

        if (shopStackOrder.getTotalAmount() == null
                || shopStackOrder.getTotalAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException("Invalid order amount");
        }

        String receipt =
                "SHOPSTACK-" + request.getOrderId();

        String razorpayOrderId =
                razorpayService.createRazorpayOrder(
                        shopStackOrder.getTotalAmount(),
                        receipt
                );

        /*
         * OrderService performs the important validation:
         * - order exists
         * - customer owns the order
         * - payment method is RAZORPAY
         * - payment has not already succeeded
         *
         * It then stores the Razorpay Order ID.
         */
        orderService.attachRazorpayOrderId(
                request.getOrderId(),
                customerEmail,
                razorpayOrderId
        );

        RazorpayOrderResponse response =
                new RazorpayOrderResponse(
                        razorpayOrderId,
                        shopStackOrder.getTotalAmount(),
                        "INR",
                        razorpayService.getKeyId()
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @RequestBody RazorpayVerifyRequest request,
            Authentication authentication) {

        if (request == null) {
            throw new RuntimeException(
                    "Payment verification data is required"
            );
        }

        if (request.getOrderId() == null) {
            throw new RuntimeException(
                    "ShopStack order ID is required"
            );
        }

        if (request.getRazorpayOrderId() == null
                || request.getRazorpayOrderId().trim().isEmpty()) {

            throw new RuntimeException(
                    "Razorpay order ID is required"
            );
        }

        if (request.getRazorpayPaymentId() == null
                || request.getRazorpayPaymentId().trim().isEmpty()) {

            throw new RuntimeException(
                    "Razorpay payment ID is required"
            );
        }

        if (request.getRazorpaySignature() == null
                || request.getRazorpaySignature().trim().isEmpty()) {

            throw new RuntimeException(
                    "Razorpay signature is required"
            );
        }

        String customerEmail = authentication.getName();

        /*
         * STEP 1
         * Verify Razorpay's signature on the backend.
         */
        boolean verified =
                razorpayService.verifyPayment(
                        request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId(),
                        request.getRazorpaySignature()
                );

        if (!verified) {
            throw new RuntimeException(
                    "Razorpay payment verification failed"
            );
        }

        /*
         * STEP 2
         * Finalize the ShopStack order.
         *
         * OrderService validates:
         * - order ownership
         * - payment method
         * - stored Razorpay order ID
         * - stock
         * - inventory
         *
         * Then it:
         * - reduces stock
         * - updates inventory
         * - updates coupon usage
         * - calculates commission
         * - marks order CONFIRMED
         * - marks payment SUCCESS
         */
        OrderResponse finalizedOrder =
                orderService.finalizeRazorpayOrder(
                        request.getOrderId(),
                        customerEmail,
                        request.getRazorpayOrderId()
                );

        /*
         * Prevent an unused-variable warning while keeping
         * the result available for debugging if needed.
         */
        if (finalizedOrder == null) {
            throw new RuntimeException(
                    "Unable to finalize ShopStack order"
            );
        }

        /*
         * STEP 3
         * Record the successful Razorpay payment.
         */
        PaymentResponse paymentResponse =
                paymentService.recordRazorpayPayment(
                        request.getOrderId(),
                        customerEmail,
                        request.getRazorpayPaymentId()
                );

        return ResponseEntity.ok(paymentResponse);
    }

    // =========================================================
    // GET PAYMENT FOR AN ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentByOrderId(
            @PathVariable Long orderId,
            Authentication authentication) {

        String customerEmail = authentication.getName();

        PaymentResponse response =
                paymentService.getPaymentByOrderId(
                        orderId,
                        customerEmail
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // GET ALL CUSTOMER PAYMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getCustomerPayments(
            Authentication authentication) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                paymentService.getCustomerPayments(
                        customerEmail
                )
        );
    }

    // =========================================================
    // RAZORPAY CREATE ORDER REQUEST
    // =========================================================

    public static class RazorpayCreateOrderRequest {

        private Long orderId;

        public RazorpayCreateOrderRequest() {
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }
    }

    // =========================================================
    // RAZORPAY ORDER RESPONSE
    // =========================================================

    public static class RazorpayOrderResponse {

        private String razorpayOrderId;

        private BigDecimal amount;

        private String currency;

        private String keyId;

        public RazorpayOrderResponse(
                String razorpayOrderId,
                BigDecimal amount,
                String currency,
                String keyId) {

            this.razorpayOrderId = razorpayOrderId;
            this.amount = amount;
            this.currency = currency;
            this.keyId = keyId;
        }

        public String getRazorpayOrderId() {
            return razorpayOrderId;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getCurrency() {
            return currency;
        }

        public String getKeyId() {
            return keyId;
        }
    }

    // =========================================================
    // RAZORPAY VERIFY REQUEST
    // =========================================================

    public static class RazorpayVerifyRequest {

        private Long orderId;

        private String razorpayOrderId;

        private String razorpayPaymentId;

        private String razorpaySignature;

        public RazorpayVerifyRequest() {
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public String getRazorpayOrderId() {
            return razorpayOrderId;
        }

        public void setRazorpayOrderId(
                String razorpayOrderId) {

            this.razorpayOrderId = razorpayOrderId;
        }

        public String getRazorpayPaymentId() {
            return razorpayPaymentId;
        }

        public void setRazorpayPaymentId(
                String razorpayPaymentId) {

            this.razorpayPaymentId = razorpayPaymentId;
        }

        public String getRazorpaySignature() {
            return razorpaySignature;
        }

        public void setRazorpaySignature(
                String razorpaySignature) {

            this.razorpaySignature = razorpaySignature;
        }
    }
}