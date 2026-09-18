package com.shopstack.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.shopstack.entity.Order;
import com.shopstack.entity.Payment;
import com.shopstack.enums.PaymentStatus;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Wraps Razorpay's order-creation and payment-verification APIs (test mode).
 * Key id/secret are injected via RazorpayConfig from environment variables —
 * never hardcoded here. See .env / application.yml.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public Payment createRazorpayOrder(Order order) {
        try {
            JSONObject options = new JSONObject();
            // Razorpay expects amount in the smallest currency unit (paise for INR)
            long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValueExact();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", order.getOrderNumber());
            options.put("payment_capture", 1);

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(options);

            Payment payment = Payment.builder()
                    .order(order)
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(order.getTotalAmount())
                    .currency("INR")
                    .status(PaymentStatus.CREATED)
                    .build();

            return paymentRepository.save(payment);
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for {}: {}", order.getOrderNumber(), e.getMessage());
            throw new BadRequestException("Unable to initiate payment at this time. Please try again.");
        }
    }

    public boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);
            return Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (RazorpayException e) {
            log.warn("Signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    @Transactional
    public Payment markSuccess(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));
        payment.setRazorpayPaymentId(razorpayPaymentId);
        payment.setRazorpaySignature(razorpaySignature);
        payment.setStatus(PaymentStatus.SUCCESS);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment markFailed(String razorpayOrderId, String reason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found"));
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        return paymentRepository.save(payment);
    }

    /**
     * Issues a Razorpay refund for a previously successful payment (full or
     * partial, in rupees). Used by the return/cancellation workflow once an
     * admin approves a return. In test mode this hits Razorpay's sandbox
     * refund API — no real money moves, but the integration logic is real.
     */
    @Transactional
    public Payment refund(Long orderId, BigDecimal amount) {
        Payment payment = getByOrderId(orderId);

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Only successfully paid orders can be refunded");
        }
        if (payment.getRazorpayPaymentId() == null) {
            throw new BadRequestException("No captured payment found for this order");
        }

        try {
            JSONObject options = new JSONObject();
            long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValueExact();
            options.put("amount", amountInPaise);
            razorpayClient.payments.refund(payment.getRazorpayPaymentId(), options);

            payment.setStatus(PaymentStatus.REFUNDED);
            return paymentRepository.save(payment);
        } catch (RazorpayException e) {
            log.error("Refund failed for order {}: {}", orderId, e.getMessage());
            throw new BadRequestException("Refund could not be processed at this time. Please try again or contact support.");
        }
    }

    public Payment getByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for this order"));
    }
}
