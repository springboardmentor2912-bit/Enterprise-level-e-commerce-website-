package com.javaenterprise.payment.service;

import com.javaenterprise.cart.dto.CartSummaryResponse;
import com.javaenterprise.cart.service.CartService;
import com.javaenterprise.coupon.dto.CouponValidationResponse;
import com.javaenterprise.coupon.service.CouponService; // 🆕 ADD THIS IMPORT
import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.service.OrderService;
import com.javaenterprise.payment.dto.PaymentResponse;
import com.javaenterprise.payment.entity.Payment;
import com.javaenterprise.payment.entity.PaymentStatus;
import com.javaenterprise.payment.repository.PaymentRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CartService cartService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final CouponService couponService; // 🆕 INJECT COUPON SERVICE

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // 🆕 ADD 'couponCode' parameter
    @Transactional
    public PaymentResponse initiatePayment(Authentication authentication, String couponCode) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartSummaryResponse cart = cartService.getCart(authentication);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 🆕 START COUPON LOGIC
        BigDecimal amount = cart.getTotalAmount();
        if (couponCode != null && !couponCode.isBlank()) {
            CouponValidationResponse v = couponService.validate(couponCode, amount);
            if (!v.isValid()) throw new RuntimeException(v.getMessage());
            amount = v.getFinalTotal(); // Razorpay will charge the discounted amount
        }
        // 🆕 END COUPON LOGIC

        try {
            // Razorpay requires amount in paise
            int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + user.getId() + "_" + System.currentTimeMillis());

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                    .transactionId(razorpayOrder.get("receipt"))
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amount) // 🆕 Save the DISCOUNTED amount to the payment record
                    .status(PaymentStatus.INITIATED)
                    .user(user)
                    .build();

            Payment saved = paymentRepository.save(payment);

            return PaymentResponse.builder()
                    .paymentId(saved.getId())
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amountInPaise(amountInPaise)
                    .amount(saved.getAmount())
                    .keyId(razorpayKeyId)
                    .status(saved.getStatus().name())
                    .build();

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    // 🆕 ADD 'couponCode' parameter
    @Transactional
    public OrderResponse verifyAndProcessPayment(Map<String, String> payload, Authentication authentication, Long addressId, String couponCode) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found"));

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isSignatureValid) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                payment.setPaymentMethod("RAZORPAY");
                paymentRepository.save(payment);

                // 1. Create the order
                OrderResponse orderResponse = orderService.checkout(authentication, addressId, couponCode);

                // 2. 🆕 Link the Payment to the newly created Order
                payment.setOrderId(orderResponse.getOrderId());
                paymentRepository.save(payment);

                return orderResponse;
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Invalid Razorpay Signature");
                paymentRepository.save(payment);
                throw new RuntimeException("Payment verification failed. Invalid signature.");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Razorpay verification error: " + e.getMessage());
        }
    }

    public List<PaymentResponse> getUserPayments(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return paymentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(p -> PaymentResponse.builder()
                        .paymentId(p.getId())
                        .transactionId(p.getTransactionId())
                        .razorpayOrderId(p.getRazorpayOrderId())
                        .amount(p.getAmount())
                        .status(p.getStatus().name())
                        .paymentMethod(p.getPaymentMethod())
                        .build())
                .toList();
    }

    // 🆕 ADD 'couponCode' parameter
    @Transactional
    public OrderResponse placeCodOrder(Long addressId, String couponCode, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartSummaryResponse cart = cartService.getCart(authentication);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // 🆕 Calculate final amount if a coupon is applied
        BigDecimal amount = cart.getTotalAmount();
        if (couponCode != null && !couponCode.isBlank()) {
            CouponValidationResponse v = couponService.validate(couponCode, amount);
            if (!v.isValid()) throw new RuntimeException(v.getMessage());
            amount = v.getFinalTotal();
        }

        // Create a COD payment record (no Razorpay involved)
        Payment payment = Payment.builder()
                .transactionId("COD_" + user.getId() + "_" + System.currentTimeMillis())
                .amount(amount) // 🆕 Save discounted amount
                .status(PaymentStatus.SUCCESS)
                .paymentMethod("COD")
                .user(user)
                .build();

        paymentRepository.save(payment);

        // 🆕 PASS couponCode to checkout
        return orderService.checkout(authentication, addressId, couponCode);
    }
}