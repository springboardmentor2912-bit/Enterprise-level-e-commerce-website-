package com.shopstack.shopstack_backend.service;

import com.razorpay.RazorpayClient;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Payment;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            RazorpayClient razorpayClient) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
    }


    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    public com.razorpay.Order createRazorpayOrder(
            Long shopstackOrderId) throws Exception {

        Order order =
                orderRepository.findById(shopstackOrderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        int amount =
                (int) Math.round(
                        order.getTotalAmount() * 100
                );

        JSONObject options =
                new JSONObject();

        options.put(
                "amount",
                amount
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                "SHOPSTACK_" + shopstackOrderId
        );

        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(
                        options
                );

        return razorpayOrder;
    }


    // =====================================================
    // DEMO PAYMENT SUCCESS
    // =====================================================

    public Payment recordSuccessfulPayment(
            Long shopstackOrderId,
            Long customerId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        Order order =
                orderRepository.findById(
                        shopstackOrderId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        )
                );


        if (!order.getCustomerId()
                .equals(customerId)) {

            throw new RuntimeException(
                    "Invalid customer"
            );
        }


        // =================================================
        // CREATE PAYMENT
        // =================================================

        Payment payment =
                new Payment();

        payment.setOrderId(
                shopstackOrderId
        );

        payment.setCustomerId(
                customerId
        );

        payment.setAmount(
                order.getTotalAmount()
        );

        payment.setPaymentMethod(
                "RAZORPAY"
        );

        payment.setStatus(
                "SUCCESS"
        );

        /*
         * Use Razorpay payment ID as transaction ID.
         * If Razorpay does not return one,
         * generate a demo transaction ID.
         */

        if (razorpayPaymentId != null &&
                !razorpayPaymentId.isBlank()) {

            payment.setTransactionId(
                    razorpayPaymentId
            );

        } else {

            payment.setTransactionId(
                    "DEMO-TXN-" +
                    System.currentTimeMillis()
            );
        }

        payment.setPaymentDate(
                LocalDateTime.now()
        );


        // =================================================
        // UPDATE ORDER
        // =================================================

        order.setPaymentStatus(
                "PAID"
        );

        order.setPaymentMethod(
                "RAZORPAY"
        );

        order.setStatus(
                "CONFIRMED"
        );


        orderRepository.save(order);


        // =================================================
        // SAVE PAYMENT
        // =================================================

        Payment savedPayment =
                paymentRepository.save(
                        payment
                );


        System.out.println(
                "===================================="
        );

        System.out.println(
                "DEMO PAYMENT SUCCESS"
        );

        System.out.println(
                "ShopStack Order: "
                        + shopstackOrderId
        );

        System.out.println(
                "Customer: "
                        + customerId
        );

        System.out.println(
                "Razorpay Order: "
                        + razorpayOrderId
        );

        System.out.println(
                "Razorpay Payment: "
                        + razorpayPaymentId
        );

        System.out.println(
                "Transaction: "
                        + savedPayment.getTransactionId()
        );

        System.out.println(
                "Amount: ₹"
                        + order.getTotalAmount()
        );

        System.out.println(
                "Status: SUCCESS"
        );

        System.out.println(
                "Order Status: CONFIRMED"
        );

        System.out.println(
                "===================================="
        );


        return savedPayment;
    }
}