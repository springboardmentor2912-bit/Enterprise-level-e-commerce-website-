package com.shopstack.shopstack_backend.controller;

import com.razorpay.Order;
import com.shopstack.shopstack_backend.entity.Payment;
import com.shopstack.shopstack_backend.repository.PaymentRepository;
import com.shopstack.shopstack_backend.service.PaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

    public PaymentController(
            PaymentService paymentService,
            PaymentRepository paymentRepository) {

        this.paymentService =
                paymentService;

        this.paymentRepository =
                paymentRepository;
    }


    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(
            @RequestParam Long orderId) {

        try {

            Order order =
                    paymentService
                            .createRazorpayOrder(
                                    orderId
                            );

            return ResponseEntity.ok(
                    order.toString()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }


    // =====================================================
    // GET PAYMENT BY SHOPSTACK ORDER ID
    // =====================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(
            @PathVariable Long orderId) {

        return paymentRepository
                .findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }


    // =====================================================
    // RECORD PAYMENT
    // =====================================================

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> data) {

        try {

            Long shopstackOrderId =
                    Long.valueOf(
                            data.get(
                                    "shopstack_order_id"
                            )
                    );


            Long customerId =
                    Long.valueOf(
                            data.get(
                                    "customer_id"
                            )
                    );


            String razorpayOrderId =
                    data.get(
                            "razorpay_order_id"
                    );


            String razorpayPaymentId =
                    data.get(
                            "razorpay_payment_id"
                    );


            String razorpaySignature =
                    data.get(
                            "razorpay_signature"
                    );


            Payment payment =
                    paymentService
                            .recordSuccessfulPayment(
                                    shopstackOrderId,
                                    customerId,
                                    razorpayOrderId,
                                    razorpayPaymentId,
                                    razorpaySignature
                            );


            return ResponseEntity.ok(
                    payment
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(
                            e.getMessage()
                    );
        }
    }
}