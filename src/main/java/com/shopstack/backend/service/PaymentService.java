package com.shopstack.backend.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Refund;
import com.razorpay.Utils;
import com.shopstack.backend.dto.PaymentFailureRequest;
import com.shopstack.backend.dto.PaymentVerificationRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private NotificationService notificationService;

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    public String createPaymentOrder(Double amount) throws Exception {

        if (amount == null || amount <= 0) {
            throw new RuntimeException("Invalid payment amount");
        }

        // Razorpay expects amount in paise
        int amountInPaise =
                (int) Math.round(amount * 100);

        JSONObject orderRequest = new JSONObject();

        orderRequest.put(
                "amount",
                amountInPaise
        );

        orderRequest.put(
                "currency",
                "INR"
        );

        orderRequest.put(
                "receipt",
                "shopstack_" + System.currentTimeMillis()
        );

        Order order =
                razorpayClient.orders.create(orderRequest);

        return order.toString();
    }


    // ==========================================
    // VERIFY RAZORPAY PAYMENT
    // ==========================================

    public boolean verifyPayment(
            PaymentVerificationRequest request) {

        try {

            JSONObject options = new JSONObject();

            options.put(
                    "razorpay_order_id",
                    request.getRazorpayOrderId()
            );

            options.put(
                    "razorpay_payment_id",
                    request.getRazorpayPaymentId()
            );

            options.put(
                    "razorpay_signature",
                    request.getRazorpaySignature()
            );

            boolean verified =
                    Utils.verifyPaymentSignature(
                            options,
                            razorpayKeySecret
                    );

            return verified;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Payment verification failed",
                    e
            );
        }
    }

    // ==========================================
    // CREATE RAZORPAY REFUND
    // ==========================================

    public Refund refundPayment(
            String razorpayPaymentId,
            Double amount,
            String receipt
    ) {
        try {
            if (razorpayPaymentId == null || razorpayPaymentId.isBlank()) {
                throw new RuntimeException("Razorpay payment ID is required");
            }

            if (amount == null || amount <= 0) {
                throw new RuntimeException("Invalid refund amount");
            }

            int amountInPaise = (int) Math.round(amount * 100);

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amountInPaise);
            refundRequest.put("receipt", receipt);

            return razorpayClient.payments.refund(
                    razorpayPaymentId,
                    refundRequest
            );

        } catch (Exception e) {
            throw new RuntimeException(
                    "Razorpay refund failed: " + e.getMessage(),
                    e
            );
        }
    }

    // ==========================================
    // FETCH RAZORPAY REFUND
    // ==========================================

    public Refund fetchRefund(
            String razorpayPaymentId,
            String refundId
    ) {
        try {
            return razorpayClient.payments.fetchRefund(
                    razorpayPaymentId,
                    refundId
            );
        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to fetch Razorpay refund: " + e.getMessage(),
                    e
            );
        }
    }

    // ==========================================
// HANDLE PAYMENT FAILURE
// ==========================================

    public void handlePaymentFailure(
            String customerEmail,
            PaymentFailureRequest request
    ) {

        if (customerEmail == null ||
                customerEmail.isBlank()) {

            throw new RuntimeException(
                    "Customer email is required"
            );
        }

        if (request == null) {
            throw new RuntimeException(
                    "Payment failure details are required"
            );
        }

        notificationService.notifyCustomerPaymentFailed(
                customerEmail,
                request.getRazorpayOrderId(),
                request.getAmount(),
                request.getErrorDescription(),
                request.getErrorReason()
        );
    }

}