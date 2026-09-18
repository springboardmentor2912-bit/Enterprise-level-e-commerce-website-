package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;

@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;

    public RazorpayService(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret) {

        this.keyId = keyId;
        this.keySecret = keySecret;
    }

    // =========================================================
    // CREATE RAZORPAY ORDER
    // =========================================================

    public String createRazorpayOrder(
            BigDecimal amount,
            String receipt) {

        try {

            if (amount == null
                    || amount.compareTo(BigDecimal.ZERO) <= 0) {

                throw new RuntimeException(
                        "Payment amount must be greater than zero");
            }

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            keyId,
                            keySecret);

            // Convert rupees to paise
            long amountInPaise =
                    amount
                            .setScale(
                                    2,
                                    RoundingMode.HALF_UP)
                            .movePointRight(2)
                            .longValueExact();

            JSONObject orderRequest =
                    new JSONObject();

            orderRequest.put(
                    "amount",
                    amountInPaise);

            orderRequest.put(
                    "currency",
                    "INR");

            orderRequest.put(
                    "receipt",
                    receipt);

            orderRequest.put(
                    "partial_payment",
                    false);

            Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest);

            return razorpayOrder
                    .get("id")
                    .toString();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to create Razorpay order: "
                            + e.getMessage(),
                    e);
        }
    }

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    public boolean verifyPayment(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) {

        try {

            if (razorpayOrderId == null
                    || razorpayOrderId.trim().isEmpty()) {

                return false;
            }

            if (razorpayPaymentId == null
                    || razorpayPaymentId.trim().isEmpty()) {

                return false;
            }

            if (razorpaySignature == null
                    || razorpaySignature.trim().isEmpty()) {

                return false;
            }

            JSONObject paymentData =
                    new JSONObject();

            paymentData.put(
                    "razorpay_order_id",
                    razorpayOrderId);

            paymentData.put(
                    "razorpay_payment_id",
                    razorpayPaymentId);

            paymentData.put(
                    "razorpay_signature",
                    razorpaySignature);

            return Utils.verifyPaymentSignature(
                    paymentData,
                    keySecret);

        } catch (Exception e) {

            return false;
        }
    }

    // =========================================================
    // GET RAZORPAY KEY ID
    // =========================================================

    public String getKeyId() {

        return keyId;
    }
}