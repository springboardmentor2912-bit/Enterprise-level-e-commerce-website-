package com.shopstack.shopstack_backend.service.impl;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.constant.PaymentStatus;
import com.shopstack.shopstack_backend.dto.request.PaymentRequest;
import com.shopstack.shopstack_backend.dto.response.PaymentResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Payment;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.notification.EmailNotificationService;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.PaymentRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.service.PaymentService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            EmailNotificationService emailNotificationService) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
    }

    // =========================================================
    // CREATE PAYMENT
    // =========================================================

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        User user = getAuthenticatedUser();

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // -----------------------------------------------------
        // Check order ownership
        // -----------------------------------------------------

        if (order.getCustomerEmail() == null ||
                !order.getCustomerEmail()
                        .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to make payment for this order");
        }

        // -----------------------------------------------------
        // Only placed orders can be paid
        // -----------------------------------------------------

        if (order.getStatus() != OrderStatus.PLACED) {

            throw new RuntimeException(
                    "Payment can only be created for a placed order");
        }

        // -----------------------------------------------------
        // Validate gateway
        // -----------------------------------------------------

        if (request.getGateway() == null ||
                request.getGateway().isBlank()) {

            throw new RuntimeException(
                    "Payment gateway is required");
        }

        String gateway =
                request.getGateway().trim().toUpperCase();

        if (!gateway.equals("RAZORPAY")) {

            throw new RuntimeException(
                    "Only RAZORPAY payment gateway is enabled");
        }

        // -----------------------------------------------------
        // Check existing payment
        // -----------------------------------------------------

        Payment existingPayment =
                paymentRepository
                        .findByOrderId(order.getId())
                        .orElse(null);

        if (existingPayment != null) {

            if (existingPayment.getStatus()
                    == PaymentStatus.SUCCESS) {

                throw new RuntimeException(
                        "Payment already completed for this order");
            }

            if (existingPayment.getStatus()
                    == PaymentStatus.PENDING) {

                return mapToResponse(existingPayment);
            }

            // FAILED payment can be retried
            paymentRepository.delete(existingPayment);
            paymentRepository.flush();
        }

        // =====================================================
        // CREATE RAZORPAY ORDER
        // =====================================================

        try {

            if (razorpayKeyId == null ||
                    razorpayKeyId.isBlank() ||
                    razorpayKeyId.startsWith("YOUR_")) {

                throw new RuntimeException(
                        "Razorpay Key ID is not configured");
            }

            if (razorpayKeySecret == null ||
                    razorpayKeySecret.isBlank() ||
                    razorpayKeySecret.startsWith("YOUR_")) {

                throw new RuntimeException(
                        "Razorpay Key Secret is not configured");
            }

            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret);

            // Razorpay expects amount in paise.
            // ₹1 = 100 paise.

            long amountInPaise =
                    Math.round(order.getTotalAmount() * 100);

            if (amountInPaise <= 0) {

                throw new RuntimeException(
                        "Order amount must be greater than zero");
            }

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
                    "shopstack_order_" + order.getId());

            com.razorpay.Order razorpayOrder =
                    razorpayClient.orders.create(
                            orderRequest);

            String razorpayOrderId =
                    razorpayOrder.get("id");

            if (razorpayOrderId == null ||
                    razorpayOrderId.isBlank()) {

                throw new RuntimeException(
                        "Razorpay did not return an order ID");
            }

            // =================================================
            // SAVE PAYMENT
            // =================================================

            Payment payment = new Payment();

            payment.setOrderId(
                    order.getId());

            payment.setAmount(
                    BigDecimal.valueOf(
                            order.getTotalAmount()));

            payment.setCurrency("INR");

            payment.setStatus(
                    PaymentStatus.PENDING);

            payment.setGateway("RAZORPAY");

            payment.setGatewayOrderId(
                    razorpayOrderId);

            Payment savedPayment =
                    paymentRepository.save(payment);

            return mapToResponse(savedPayment);

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to create Razorpay payment order: "
                            + exception.getMessage(),
                    exception);
        }
    }

    // =========================================================
    // GET PAYMENT BY ORDER
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(
            Long orderId) {

        User user = getAuthenticatedUser();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"));

        if (order.getCustomerEmail() == null ||
                !order.getCustomerEmail()
                        .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to access this payment");
        }

        Payment payment =
                paymentRepository
                        .findByOrderId(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found for this order"));

        return mapToResponse(payment);
    }

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    @Override
    @Transactional(
            noRollbackFor =
                    PaymentVerificationFailedException.class)
    public PaymentResponse verifyPayment(
            Long paymentId,
            String paymentOrderId,
            String paymentReference,
            String signature) {

        User user = getAuthenticatedUser();

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"));

        Order order =
                orderRepository.findById(
                                payment.getOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        // -----------------------------------------------------
        // Security check
        // -----------------------------------------------------

        if (order.getCustomerEmail() == null ||
                !order.getCustomerEmail()
                        .equalsIgnoreCase(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to verify this payment");
        }

        // -----------------------------------------------------
        // Already successful
        // -----------------------------------------------------

        if (payment.getStatus()
                == PaymentStatus.SUCCESS) {

            return mapToResponse(payment);
        }

        // -----------------------------------------------------
        // Required validation
        // -----------------------------------------------------

        if (paymentOrderId == null ||
                paymentOrderId.isBlank()) {

            failPayment(
                    payment,
                    "Payment order ID is required");
        }

        if (paymentReference == null ||
                paymentReference.isBlank()) {

            failPayment(
                    payment,
                    "Payment reference is required");
        }

        if (signature == null ||
                signature.isBlank()) {

            failPayment(
                    payment,
                    "Payment signature is required");
        }

        // =====================================================
        // VERIFY ORDER ID
        // =====================================================

        if (payment.getGatewayOrderId() == null ||
                !payment.getGatewayOrderId()
                        .equals(paymentOrderId)) {

            failPayment(
                    payment,
                    "Invalid Razorpay order ID");
        }

        // =====================================================
        // VERIFY RAZORPAY SIGNATURE
        // =====================================================

        try {

            JSONObject options =
                    new JSONObject();

            options.put(
                    "razorpay_order_id",
                    paymentOrderId);

            options.put(
                    "razorpay_payment_id",
                    paymentReference);

            options.put(
                    "razorpay_signature",
                    signature);

            boolean valid =
                    Utils.verifyPaymentSignature(
                            options,
                            razorpayKeySecret);

            if (!valid) {

                failPayment(
                        payment,
                        "Razorpay payment signature verification failed");
            }

        } catch (PaymentVerificationFailedException exception) {

            throw exception;

        } catch (Exception exception) {

            failPayment(
                    payment,
                    "Razorpay signature verification failed");
        }

        // =====================================================
        // PAYMENT SUCCESS
        // =====================================================

        payment.setGatewayPaymentId(
                paymentReference);

        payment.setGatewaySignature(
                signature);

        payment.setStatus(
                PaymentStatus.SUCCESS);

        Payment savedPayment =
                paymentRepository.save(payment);

        // =====================================================
        // CONFIRM ORDER
        // =====================================================

        if (order.getStatus() == OrderStatus.PLACED) {

            order.setStatus(
                    OrderStatus.CONFIRMED);

            orderRepository.save(order);
        }

        // =====================================================
        // PAYMENT SUCCESS EMAIL
        // =====================================================

        sendPaymentSuccessEmail(
                order,
                savedPayment
        );

        return mapToResponse(savedPayment);
    }

    // =========================================================
    // MARK PAYMENT AS FAILED
    // =========================================================

    private void failPayment(
            Payment payment,
            String message) {

        payment.setStatus(
                PaymentStatus.FAILED);

        Payment failedPayment =
                paymentRepository.saveAndFlush(payment);

        // =====================================================
        // PAYMENT FAILED EMAIL
        // =====================================================

        Order order =
                orderRepository.findById(
                                payment.getOrderId())
                        .orElse(null);

        if (order != null) {

            sendPaymentFailedEmail(
                    order,
                    failedPayment,
                    message
            );
        }

        throw new PaymentVerificationFailedException(
                message);
    }

    // =========================================================
    // PAYMENT SUCCESS EMAIL
    // =========================================================

    private void sendPaymentSuccessEmail(
            Order order,
            Payment payment) {

        if (order.getCustomerEmail() == null ||
                order.getCustomerEmail().isBlank()) {

            return;
        }

        StringBuilder body =
                new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Your ShopStack payment was completed successfully.\n\n"
        );

        body.append("Payment Details\n");
        body.append("------------------------------\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Payment ID: ")
                .append(payment.getGatewayPaymentId())
                .append("\n");

        body.append("Amount: ₹")
                .append(payment.getAmount())
                .append("\n");

        body.append("Payment Status: ")
                .append(payment.getStatus())
                .append("\n");

        body.append("\nThank you for shopping with ShopStack.\n");

        emailNotificationService.sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Payment Successful",
                body.toString()
        );
    }

    // =========================================================
    // PAYMENT FAILED EMAIL
    // =========================================================

    private void sendPaymentFailedEmail(
            Order order,
            Payment payment,
            String reason) {

        if (order.getCustomerEmail() == null ||
                order.getCustomerEmail().isBlank()) {

            return;
        }

        StringBuilder body =
                new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Unfortunately, your ShopStack payment could not be completed.\n\n"
        );

        body.append("Payment Details\n");
        body.append("------------------------------\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Amount: ₹")
                .append(payment.getAmount())
                .append("\n");

        body.append("Payment Status: ")
                .append(payment.getStatus())
                .append("\n");

        if (reason != null &&
                !reason.isBlank()) {

            body.append("Reason: ")
                    .append(reason)
                    .append("\n");
        }

        body.append(
                "\nPlease try the payment again.\n"
        );

        body.append(
                "\nThank you for shopping with ShopStack.\n"
        );

        emailNotificationService.sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Payment Failed",
                body.toString()
        );
    }

    // =========================================================
    // ADMIN PAYMENT STATUS
    // =========================================================

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(
            Long paymentId,
            String status) {

        Payment payment =
                paymentRepository.findById(paymentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment not found"));

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Payment status is required");
        }

        PaymentStatus newStatus;

        try {

            newStatus =
                    PaymentStatus.valueOf(
                            status.toUpperCase());

        } catch (IllegalArgumentException exception) {

            throw new RuntimeException(
                    "Invalid payment status: " + status);
        }

        // SUCCESS must come through Razorpay verification
        if (newStatus == PaymentStatus.SUCCESS) {

            throw new RuntimeException(
                    "Payment SUCCESS can only be set after payment verification");
        }

        // Refunded payment cannot be changed
        if (payment.getStatus()
                == PaymentStatus.REFUNDED) {

            throw new RuntimeException(
                    "Refunded payment cannot be updated");
        }

        Order order =
                orderRepository.findById(
                                payment.getOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found for payment"));

        // =====================================================
        // REFUND
        // =====================================================

        if (newStatus == PaymentStatus.REFUNDED) {

            if (order.getStatus()
                    != OrderStatus.RETURNED) {

                throw new RuntimeException(
                        "Payment can only be refunded after the order is returned");
            }

            order.setStatus(
                    OrderStatus.REFUNDED);

            orderRepository.save(order);
        }

        payment.setStatus(newStatus);

        Payment updatedPayment =
                paymentRepository.save(payment);

        return mapToResponse(updatedPayment);
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"));
    }

    // =========================================================
    // RESPONSE MAPPER
    // =========================================================

    private PaymentResponse mapToResponse(
            Payment payment) {

        PaymentResponse response =
                new PaymentResponse(
                        payment.getId(),
                        payment.getOrderId(),
                        payment.getAmount(),
                        payment.getCurrency(),
                        payment.getStatus(),
                        payment.getGateway(),
                        payment.getGatewayOrderId(),
                        payment.getGatewayPaymentId(),
                        null,
                        payment.getCreatedAt(),
                        payment.getUpdatedAt()
                );

        response.setRazorpayKeyId(
                razorpayKeyId);

        return response;
    }

    // =========================================================
    // PAYMENT VERIFICATION EXCEPTION
    // =========================================================

    private static class PaymentVerificationFailedException
            extends RuntimeException {

        public PaymentVerificationFailedException(
                String message) {

            super(message);
        }
    }
}