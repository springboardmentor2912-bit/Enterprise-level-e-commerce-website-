package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }


    // =====================================================
    // CREATE ORDER
    // =====================================================

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody Order order) {

        return ResponseEntity.ok(
                orderService.createOrder(order)
        );
    }


    // =====================================================
    // GET CUSTOMER ORDERS
    // =====================================================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                orderService.getCustomerOrders(
                        customerId
                )
        );
    }


    // =====================================================
    // GET SINGLE ORDER
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrder(id)
        );
    }


    // =====================================================
    // PAYMENT SUCCESS
    // =====================================================

    @PostMapping("/{id}/payment-success")
    public ResponseEntity<?> paymentSuccess(
            @PathVariable Long id,
            @RequestBody(required = false)
            Map<String, String> paymentData) {

        try {

            String paymentId = null;

            String razorpayOrderId = null;


            if (paymentData != null) {

                paymentId =
                        paymentData.get(
                                "razorpay_payment_id"
                        );

                razorpayOrderId =
                        paymentData.get(
                                "razorpay_order_id"
                        );
            }


            Order order =
                    orderService.markPaymentSuccessful(
                            id,
                            paymentId,
                            razorpayOrderId
                    );


            return ResponseEntity.ok(order);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // PAYMENT FAILED
    // =====================================================

    @PostMapping("/{id}/payment-failed")
    public ResponseEntity<?> paymentFailed(
            @PathVariable Long id) {

        try {

            return ResponseEntity.ok(
                    orderService.markPaymentFailed(id)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // CANCEL
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long id,
            @RequestParam Long customerId) {

        try {

            return ResponseEntity.ok(
                    orderService.cancelOrder(
                            id,
                            customerId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // RETURN
    // =====================================================

    @PutMapping("/{id}/return")
    public ResponseEntity<?> returnOrder(
            @PathVariable Long id,
            @RequestParam Long customerId) {

        try {

            return ResponseEntity.ok(
                    orderService.returnOrder(
                            id,
                            customerId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // REFUND
    // =====================================================

    @PutMapping("/{id}/refund")
    public ResponseEntity<?> refundOrder(
            @PathVariable Long id,
            @RequestParam Long customerId) {

        try {

            return ResponseEntity.ok(
                    orderService.refundOrder(
                            id,
                            customerId
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}