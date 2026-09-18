package shopstack_backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import shopstack_backend.entity.Order;
import shopstack_backend.entity.OrderItem;
import shopstack_backend.entity.Payment;
import shopstack_backend.entity.Refund;

/**
 * All outbound customer email lives here: password reset (existing) plus
 * the Notification Module (order / payment / shipment / refund emails).
 *
 * Every public send* method is wired to fire automatically from the real
 * business workflow that produces the event (see OrderService,
 * RazorpayPaymentService, OrderStatusService, RefundService) — there is no
 * standalone "send email" button anywhere.
 *
 * Every send is best-effort: a JavaMailSender failure is logged, never
 * thrown, so a broken SMTP connection can't roll back an order, payment,
 * shipment update, or refund.
 */
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final JavaMailSender mailSender;

    // The base URL of your React app's reset-password page, e.g.
    // http://localhost:5173/reset-password
    @Value("${app.frontend-reset-url}")
    private String frontendResetUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ------------------------------------------------------------------
    // Existing: password reset
    // ------------------------------------------------------------------

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendResetUrl + "?token=" + token;
        send(toEmail, "ShopStack — Reset Your Password",
                "We received a request to reset your ShopStack password.\n\n" +
                "Click the link below to choose a new password. This link " +
                "expires in 30 minutes:\n\n" +
                resetLink + "\n\n" +
                "If you didn't request this, you can safely ignore this email.");
    }

    // ------------------------------------------------------------------
    // Notification Module
    // ------------------------------------------------------------------

    /** Order Placed — fired right after an order is successfully created. */
    public void sendOrderPlacedEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) return;

        String productLines = order.getItems() == null ? "" : order.getItems().stream()
                .map(this::formatOrderItemLine)
                .collect(Collectors.joining("\n"));

        String body =
                "Hi " + safeName(order.getUser().getFullName()) + ",\n\n" +
                "Thanks for shopping with ShopStack! We've received your order.\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Order Date: " + formatDate(order.getCreatedAt()) + "\n" +
                "Order Status: " + order.getStatus() + "\n\n" +
                "Items:\n" + productLines + "\n\n" +
                "Total Amount: Rs. " + order.getTotalAmount() + "\n\n" +
                "We'll notify you again once your order ships.\n\n" +
                "— Team ShopStack";

        send(order.getUser().getEmail(), "ShopStack — Order Confirmed (#" + order.getId() + ")", body);
    }

    /** Payment Successful — fired when a payment is recorded/verified as SUCCESS. */
    public void sendPaymentSuccessEmail(Order order, Payment payment) {
        if (order == null || payment == null || order.getUser() == null || order.getUser().getEmail() == null) return;

        String body =
                "Hi " + safeName(order.getUser().getFullName()) + ",\n\n" +
                "We've successfully received your payment for order #" + order.getId() + ".\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Payment ID: " + payment.getTransactionId() + "\n" +
                "Amount Paid: Rs. " + payment.getAmount() + "\n" +
                "Payment Status: " + payment.getStatus() + "\n\n" +
                "— Team ShopStack";

        send(order.getUser().getEmail(), "ShopStack — Payment Successful (Order #" + order.getId() + ")", body);
    }

    /** Payment Failed — fired on a bad signature or a captured payment whose order couldn't be created. */
    public void sendPaymentFailedEmail(String toEmail, String reason) {
        if (toEmail == null) return;

        String body =
                "Hi,\n\n" +
                "We couldn't process your recent payment on ShopStack.\n\n" +
                "Reason: " + (reason != null ? reason : "Payment could not be verified.") + "\n\n" +
                "If any amount was deducted, it will be automatically refunded within " +
                "5-7 business days. Please try again or use a different payment method.\n\n" +
                "— Team ShopStack";

        send(toEmail, "ShopStack — Payment Failed", body);
    }

    /** Order Shipped — fired the moment an order's overall status first becomes SHIPPED. */
    public void sendOrderShippedEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) return;

        String body =
                "Hi " + safeName(order.getUser().getFullName()) + ",\n\n" +
                "Good news! Your order has been shipped.\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Current Status: " + order.getStatus() + "\n" +
                "Shipping To: " + formatAddress(order) + "\n\n" +
                "We'll let you know as soon as it's delivered.\n\n" +
                "— Team ShopStack";

        send(order.getUser().getEmail(), "ShopStack — Order Shipped (#" + order.getId() + ")", body);
    }

    /** Order Delivered — fired the moment an order's overall status first becomes DELIVERED. */
    public void sendOrderDeliveredEmail(Order order) {
        if (order == null || order.getUser() == null || order.getUser().getEmail() == null) return;

        String body =
                "Hi " + safeName(order.getUser().getFullName()) + ",\n\n" +
                "Your order has been delivered. We hope you love it!\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Status: " + order.getStatus() + "\n\n" +
                "If anything's not right, you can start a return from your Order History page.\n\n" +
                "— Team ShopStack";

        send(order.getUser().getEmail(), "ShopStack — Order Delivered (#" + order.getId() + ")", body);
    }

    /** Refund Completed — fired the moment a refund's status becomes PROCESSED (gateway or manual/COD). */
    public void sendRefundCompletedEmail(Refund refund) {
        if (refund == null || refund.getOrderItem() == null || refund.getOrderItem().getOrder() == null) return;
        Order order = refund.getOrderItem().getOrder();
        if (order.getUser() == null || order.getUser().getEmail() == null) return;

        String body =
                "Hi " + safeName(order.getUser().getFullName()) + ",\n\n" +
                "Your refund has been processed.\n\n" +
                "Order ID: " + order.getId() + "\n" +
                "Item: " + refund.getOrderItem().getProductName() + "\n" +
                "Refund Amount: Rs. " + refund.getAmount() + "\n" +
                "Refund Status: " + refund.getStatus() + "\n" +
                (refund.getGatewayRefundId() != null ? "Refund Reference: " + refund.getGatewayRefundId() + "\n" : "") +
                "\nIt may take 5-7 business days to reflect in your account.\n\n" +
                "— Team ShopStack";

        send(order.getUser().getEmail(), "ShopStack — Refund Completed (Order #" + order.getId() + ")", body);
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email sent to {} — subject: {}", to, subject);
        } catch (Exception e) {
            // Never let an email/SMTP failure break the business transaction
            // that triggered it (order placement, payment, shipment, refund).
            logger.error("Failed to send email to {} (subject: {}): {}", to, subject, e.getMessage());
        }
    }

    private String formatOrderItemLine(OrderItem item) {
        return "- " + item.getProductName() + " x" + item.getQuantity() +
                " = Rs. " + item.getLineTotal();
    }

    private String formatAddress(Order order) {
        StringBuilder sb = new StringBuilder();
        if (order.getShippingAddressLine1() != null) sb.append(order.getShippingAddressLine1()).append(", ");
        if (order.getShippingCity() != null) sb.append(order.getShippingCity()).append(", ");
        if (order.getShippingState() != null) sb.append(order.getShippingState()).append(" ");
        if (order.getShippingPostalCode() != null) sb.append(order.getShippingPostalCode());
        return sb.toString();
    }

    private String formatDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_FORMAT) : "";
    }

    private String safeName(String name) {
        return name != null ? name : "there";
    }
}