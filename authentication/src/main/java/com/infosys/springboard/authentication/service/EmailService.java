package com.infosys.springboard.authentication.service;

import java.util.List;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.OrderItem;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =========================================================
    // GENERIC EMAIL
    // =========================================================

    public void sendEmail(
            String to,
            String subject,
            String body) {

        try {
            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            System.out.println(
                    "Email sent successfully to: " + to);

        } catch (Exception e) {
            System.err.println(
                    "Failed to send email to "
                            + to
                            + ": "
                            + e.getMessage());
        }
    }

    // =========================================================
    // ORDER PLACED EMAIL
    // =========================================================

    public void sendOrderPlacedEmail(
            Order order,
            List<OrderItem> items) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");
        body.append(
                "Thank you for shopping with ShopStack!\n\n");
        body.append(
                "Your order has been placed successfully.\n\n");

        body.append("========================================\n");
        body.append("ORDER DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Order Date: ")
                .append(order.getOrderDate())
                .append("\n");

        body.append("Status: ")
                .append(order.getStatus())
                .append("\n");

        body.append("Payment Method: ")
                .append(order.getPaymentMethod())
                .append("\n");

        body.append("Payment Status: ")
                .append(order.getPaymentStatus())
                .append("\n\n");

        body.append("PRODUCTS\n");
        body.append("----------------------------------------\n");

        for (OrderItem item : items) {

            body.append("Product: ")
                    .append(item.getProductName())
                    .append("\n");

            body.append("Quantity: ")
                    .append(item.getQuantity())
                    .append("\n");

            body.append("Price: ₹")
                    .append(item.getPrice())
                    .append("\n");

            body.append("Subtotal: ₹")
                    .append(item.getSubtotal())
                    .append("\n\n");
        }

        body.append("========================================\n");

        body.append("Total Amount: ₹")
                .append(order.getTotalAmount())
                .append("\n");

        body.append("========================================\n\n");

        body.append(
                "We will keep you updated about your order.\n\n");

        body.append(
                "Thank you for choosing ShopStack!\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Order Placed Successfully #"
                        + order.getId(),
                body.toString());
    }

    // =========================================================
    // PAYMENT SUCCESSFUL EMAIL
    // =========================================================

    public void sendPaymentSuccessEmail(
            Order order,
            String paymentId) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Your payment for the ShopStack order "
                        + "was successful.\n\n");

        body.append("========================================\n");
        body.append("PAYMENT DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Payment ID: ")
                .append(paymentId)
                .append("\n");

        body.append("Amount: ₹")
                .append(order.getTotalAmount())
                .append("\n");

        body.append("Payment Status: SUCCESS\n");

        body.append("Payment Method: ")
                .append(order.getPaymentMethod())
                .append("\n");

        body.append("========================================\n\n");

        body.append(
                "Your order is now being processed.\n\n");

        body.append(
                "Thank you for shopping with ShopStack!\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Payment Successful for Order #"
                        + order.getId(),
                body.toString());
    }

    // =========================================================
    // PAYMENT FAILED EMAIL
    // =========================================================

    public void sendPaymentFailedEmail(
            Order order,
            String paymentId) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Unfortunately, your payment for the "
                        + "ShopStack order could not be completed.\n\n");

        body.append("========================================\n");
        body.append("PAYMENT DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Payment ID: ")
                .append(paymentId)
                .append("\n");

        body.append("Amount: ₹")
                .append(order.getTotalAmount())
                .append("\n");

        body.append("Payment Status: FAILED\n");

        body.append("Payment Method: ")
                .append(order.getPaymentMethod())
                .append("\n");

        body.append("========================================\n\n");

        body.append(
                "Please try the payment again or use another "
                        + "payment method.\n\n");

        body.append(
                "If the amount was deducted from your account, "
                        + "please contact your bank/payment provider.\n\n");

        body.append(
                "Thank you for choosing ShopStack.\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Payment Failed for Order #"
                        + order.getId(),
                body.toString());
    }

    // =========================================================
    // ORDER SHIPPED EMAIL
    // =========================================================

    public void sendOrderShippedEmail(Order order) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Great news! Your ShopStack order has been shipped.\n\n");

        body.append("========================================\n");
        body.append("SHIPMENT DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Order Date: ")
                .append(order.getOrderDate())
                .append("\n");

        body.append("Order Status: SHIPPED\n");

        body.append(
                "Shipment Status: Your order is on the way.\n");

        body.append("========================================\n\n");

        body.append(
                "Your order has been handed over for delivery.\n\n");

        body.append(
                "Thank you for shopping with ShopStack!\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Order Shipped #"
                        + order.getId(),
                body.toString());
    }

    // =========================================================
    // ORDER DELIVERED EMAIL
    // =========================================================

    public void sendOrderDeliveredEmail(Order order) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Your ShopStack order has been delivered successfully.\n\n");

        body.append("========================================\n");
        body.append("DELIVERY DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Order Date: ")
                .append(order.getOrderDate())
                .append("\n");

        body.append("Delivery Status: DELIVERED\n");

        body.append("========================================\n\n");

        body.append(
                "We hope you enjoy your purchase!\n\n");

        body.append(
                "Thank you for shopping with ShopStack!\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Order Delivered #"
                        + order.getId(),
                body.toString());
    }

    // =========================================================
    // REFUND COMPLETED EMAIL
    // =========================================================

    public void sendRefundCompletedEmail(Order order) {

        StringBuilder body = new StringBuilder();

        body.append("Hello,\n\n");

        body.append(
                "Your refund for the ShopStack order "
                        + "has been processed successfully.\n\n");

        body.append("========================================\n");
        body.append("REFUND DETAILS\n");
        body.append("========================================\n\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Refund Amount: ₹")
                .append(order.getRefundAmount())
                .append("\n");

        body.append("Refund Status: ")
                .append(order.getReturnStatus())
                .append("\n");

        body.append("Refund Transaction ID: ")
                .append(order.getRefundTransactionId())
                .append("\n");

        body.append("Refund Date: ")
                .append(order.getRefundDate())
                .append("\n");

        body.append("========================================\n\n");

        body.append(
                "The refund will be credited according to "
                        + "your bank or payment provider's processing time.\n\n");

        body.append(
                "Thank you for choosing ShopStack!\n");

        sendEmail(
                order.getCustomerEmail(),
                "ShopStack - Refund Completed for Order #"
                        + order.getId(),
                body.toString());
    }
}