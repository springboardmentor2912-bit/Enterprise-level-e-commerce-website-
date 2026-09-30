package com.shopstack.backend.service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.UserRepository;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    /**
     * Resolve customer email and name from User or Order.
     */
    private User resolveCustomerUser(Long userId, User user) {
        if (user != null) {
            return user;
        }
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                return userOpt.get();
            }
        }
        return null;
    }

    /**
     * 1. Order Placed Notification (Email)
     */
    public void sendOrderPlacedNotification(Order order, List<OrderItem> items, User user) {
        if (order == null) {
            log.warn("[NotificationService] Cannot send OrderPlaced email: order is null");
            return;
        }

        User customer = resolveCustomerUser(order.getUserId(), user);
        String recipientEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : null;
        String recipientName = (customer != null && customer.getFullName() != null) 
                ? customer.getFullName() 
                : (order.getRecipientName() != null ? order.getRecipientName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Order ID {}", order.getOrderId());
            return;
        }

        List<OrderItem> orderItems = items;
        if (orderItems == null || orderItems.isEmpty()) {
            orderItems = orderItemRepository.findByOrderId(order.getOrderId());
        }

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", order.getOrderId());
        model.put("orderDate", order.getDate() != null ? order.getDate() : new SimpleDateFormat("MMM dd, yyyy").format(new Date()));
        model.put("orderStatus", order.getStatus() != null ? order.getStatus() : "CONFIRMED");
        model.put("paymentMethod", order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");
        model.put("totalAmount", order.getTotalAmount());
        model.put("deliveryAddress", order.getDeliveryAddress());
        model.put("recipientPhone", order.getRecipientPhone());
        model.put("items", orderItems);
        model.put("couponCode", order.getCouponCode());
        model.put("couponDiscount", order.getCouponDiscount());

        String subject = "Order Confirmation - #" + order.getOrderId() + " | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/order-placed", model);
    }

    /**
     * 2. Payment Successful Notification (Email)
     */
    public void sendPaymentSuccessNotification(Order order, String paymentId, double amount, String paymentMethod, User user) {
        if (order == null) {
            log.warn("[NotificationService] Cannot send PaymentSuccess email: order is null");
            return;
        }

        User customer = resolveCustomerUser(order.getUserId(), user);
        String recipientEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : null;
        String recipientName = (customer != null && customer.getFullName() != null) 
                ? customer.getFullName() 
                : (order.getRecipientName() != null ? order.getRecipientName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Payment Success on Order ID {}", order.getOrderId());
            return;
        }

        String effectivePaymentId = paymentId != null ? paymentId : order.getRazorpayPaymentId();
        double effectiveAmount = amount > 0 ? amount : order.getTotalAmount();
        String effectiveMethod = paymentMethod != null ? paymentMethod : (order.getPaymentMethod() != null ? order.getPaymentMethod() : "RAZORPAY");

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", order.getOrderId());
        model.put("paymentId", effectivePaymentId != null ? effectivePaymentId : "N/A");
        model.put("amount", effectiveAmount);
        model.put("paymentMethod", effectiveMethod);
        model.put("paymentStatus", "SUCCESS");
        model.put("date", new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date()));

        String subject = "Payment Confirmed for Order #" + order.getOrderId() + " | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/payment-success", model);
    }

    /**
     * 3. Payment Failed Notification (Email)
     */
    public void sendPaymentFailedNotification(Long userId, String customerEmail, String customerName, 
                                             String orderId, String razorpayOrderId, double amount, 
                                             String failureReason, User user) {
        User customer = resolveCustomerUser(userId, user);
        String recipientEmail = customerEmail != null && !customerEmail.trim().isEmpty() 
                ? customerEmail 
                : (customer != null ? customer.getEmail() : null);
        String recipientName = customerName != null && !customerName.trim().isEmpty() 
                ? customerName 
                : (customer != null ? customer.getFullName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Payment Failure event (userId: {}, orderId: {})", userId, orderId);
            return;
        }

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", orderId != null ? orderId : "N/A");
        model.put("razorpayOrderId", razorpayOrderId != null ? razorpayOrderId : "");
        model.put("amount", amount);
        model.put("failureReason", failureReason != null ? failureReason : "Transaction authorization declined or dismissed by user.");
        model.put("date", new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date()));

        String subject = "Payment Issue - Checkout Attempt Incomplete | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/payment-failed", model);
    }

    /**
     * 4. Order Shipped Notification (Email)
     */
    public void sendOrderShippedNotification(Order order, String trackingNumber, String carrierOrWarehouse, String shippedAt, User user) {
        if (order == null) {
            log.warn("[NotificationService] Cannot send OrderShipped email: order is null");
            return;
        }

        User customer = resolveCustomerUser(order.getUserId(), user);
        String recipientEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : null;
        String recipientName = (customer != null && customer.getFullName() != null) 
                ? customer.getFullName() 
                : (order.getRecipientName() != null ? order.getRecipientName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Order Shipped on Order ID {}", order.getOrderId());
            return;
        }

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", order.getOrderId());
        model.put("status", "SHIPPED");
        model.put("trackingNumber", trackingNumber != null ? trackingNumber : ("TRK-" + Math.abs(order.getOrderId().hashCode())));
        model.put("carrierOrWarehouse", carrierOrWarehouse != null ? carrierOrWarehouse : "ShopStack Express Logistics");
        model.put("shippedAt", shippedAt != null ? shippedAt : new SimpleDateFormat("MMM dd, yyyy").format(new Date()));
        model.put("deliveryAddress", order.getDeliveryAddress());

        String subject = "Your Order #" + order.getOrderId() + " Has Shipped! 📦 | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/order-shipped", model);
    }

    /**
     * 5. Order Delivered Notification (Email)
     */
    public void sendOrderDeliveredNotification(Order order, String deliveredAt, User user) {
        if (order == null) {
            log.warn("[NotificationService] Cannot send OrderDelivered email: order is null");
            return;
        }

        User customer = resolveCustomerUser(order.getUserId(), user);
        String recipientEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : null;
        String recipientName = (customer != null && customer.getFullName() != null) 
                ? customer.getFullName() 
                : (order.getRecipientName() != null ? order.getRecipientName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Order Delivered on Order ID {}", order.getOrderId());
            return;
        }

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", order.getOrderId());
        model.put("status", "DELIVERED");
        model.put("deliveredAt", deliveredAt != null ? deliveredAt : new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date()));
        model.put("recipientAddress", order.getDeliveryAddress());

        String subject = "Order Delivered - #" + order.getOrderId() + " 🎉 | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/order-delivered", model);
    }

    /**
     * 6. Refund Completed Notification (Email)
     */
    public void sendRefundCompletedNotification(Refund refund, Order order, User user) {
        if (refund == null && order == null) {
            log.warn("[NotificationService] Cannot send RefundCompleted email: refund and order are both null");
            return;
        }

        Order associatedOrder = order;
        if (associatedOrder == null && refund != null && refund.getOrderId() != null) {
            String ordId = refund.getOrderId().trim();
            associatedOrder = orderRepository.findByOrderId(ordId).orElse(null);
            if (associatedOrder == null) {
                try {
                    Long numId = Long.parseLong(ordId);
                    associatedOrder = orderRepository.findById(numId).orElse(null);
                } catch (NumberFormatException ignored) {}
            }
        }

        Long userId = associatedOrder != null ? associatedOrder.getUserId() : null;
        User customer = resolveCustomerUser(userId, user);
        String recipientEmail = (customer != null && customer.getEmail() != null) ? customer.getEmail() : null;
        String recipientName = (customer != null && customer.getFullName() != null) 
                ? customer.getFullName() 
                : (associatedOrder != null && associatedOrder.getRecipientName() != null ? associatedOrder.getRecipientName() : "Customer");

        if (recipientEmail == null) {
            log.warn("[NotificationService] No valid recipient email found for Refund Completed (Order ID: {}, Refund ID: {}, User ID: {})", 
                    associatedOrder != null ? associatedOrder.getOrderId() : (refund != null ? refund.getOrderId() : "N/A"),
                    refund != null ? refund.getId() : "N/A",
                    userId);
            return;
        }

        double refundAmount = refund != null ? refund.getAmount() : (associatedOrder != null ? associatedOrder.getTotalAmount() : 0.0);
        String refundRefId = refund != null && refund.getRazorpayRefundId() != null 
                ? refund.getRazorpayRefundId() 
                : "rfnd_" + System.currentTimeMillis();
        String processedAt = refund != null && refund.getProcessedAt() != null 
                ? refund.getProcessedAt() 
                : new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());
        String reason = refund != null && refund.getReason() != null ? refund.getReason() : "Return Approved & Quality Check Passed";

        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", recipientName);
        model.put("orderId", associatedOrder != null ? associatedOrder.getOrderId() : (refund != null ? refund.getOrderId() : "N/A"));
        model.put("refundAmount", refundAmount);
        model.put("refundId", refundRefId);
        model.put("status", "PROCESSED");
        model.put("reason", reason);
        model.put("processedAt", processedAt);

        String orderIdStr = associatedOrder != null ? associatedOrder.getOrderId() : (refund != null ? refund.getOrderId() : "");
        String subject = "Refund Processed for Order #" + orderIdStr + " 💸 | ShopStack";
        emailService.sendHtmlEmail(recipientEmail, subject, "email/refund-completed", model);
    }
}
