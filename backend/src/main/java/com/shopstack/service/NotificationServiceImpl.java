package com.shopstack.service;

import com.shopstack.entity.*;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.notification.from-email:noreply@shopstack.com}")
    private String fromEmail;

    @Value("${app.notification.enabled:true}")
    private boolean notificationEnabled;

    @Autowired
    public NotificationServiceImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ─── 1. ORDER PLACED NOTIFICATION ─────────────────────────────────────────────

    @Override
    @Async
    public void sendOrderPlacedEmail(Order order) {
        if (!shouldSend(order != null ? order.getCustomer() : null)) return;

        Customer customer = order.getCustomer();
        String recipient = customer.getEmail();
        String subject = "Order Confirmation - ShopStack Order #" + order.getId();

        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                String productName = item.getProduct() != null ? item.getProduct().getName() : "Product";
                itemsHtml.append(String.format("""
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #334155; color: #f8fafc;">%s</td>
                      <td style="padding: 10px; border-bottom: 1px solid #334155; color: #f8fafc; text-align: center;">%d</td>
                      <td style="padding: 10px; border-bottom: 1px solid #334155; color: #f8fafc; text-align: right;">₹%.2f</td>
                    </tr>
                    """, productName, item.getQuantity(), item.getPriceAtPurchase()));
            }
        }

        String orderDate = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"))
                : "N/A";

        String htmlContent = buildEmailTemplate(
                "Order Confirmation",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "Thank you for your order! Your order has been placed successfully and is being processed.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #334155;">
                      <h3 style="color: #6366f1; margin-top: 0;">Order Summary</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order ID:</strong> #%d</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order Date:</strong> %s</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">%s</span></p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Shipping Address:</strong> %s</p>
                      
                      <table style="width: 100%%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                          <tr style="background-color: #1e293b;">
                            <th style="padding: 10px; text-align: left; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Item</th>
                            <th style="padding: 10px; text-align: center; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Qty</th>
                            <th style="padding: 10px; text-align: right; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          %s
                        </tbody>
                      </table>
                      
                      <div style="text-align: right; margin-top: 15px; border-top: 1px solid #334155; padding-top: 10px;">
                        <p style="color: #f8fafc; font-size: 18px; font-weight: bold; margin: 0;">Total Amount: ₹%.2f</p>
                      </div>
                    </div>
                    """,
                        order.getId(),
                        orderDate,
                        order.getStatus(),
                        order.getShippingAddress() != null ? order.getShippingAddress() : "Default Address",
                        itemsHtml.toString(),
                        order.getTotalAmount()
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "ORDER_PLACED (#" + order.getId() + ")");
    }

    // ─── 2. PAYMENT SUCCESS NOTIFICATION ──────────────────────────────────────────

    @Override
    @Async
    public void sendPaymentSuccessEmail(Order order, Payment payment) {
        if (!shouldSend(order != null ? order.getCustomer() : null)) return;

        Customer customer = order.getCustomer();
        String recipient = customer.getEmail();
        String subject = "Payment Successful - ShopStack Order #" + order.getId();

        String paymentIdStr = (payment != null && payment.getRazorpayPaymentId() != null)
                ? payment.getRazorpayPaymentId()
                : "N/A";

        BigDecimal amount = payment != null && payment.getAmount() != null
                ? payment.getAmount()
                : (order != null ? order.getTotalAmount() : BigDecimal.ZERO);

        String htmlContent = buildEmailTemplate(
                "Payment Receipt",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "Your payment was received successfully! We have confirmed your order and sent it for fulfillment.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #10b981;">
                      <h3 style="color: #10b981; margin-top: 0;">✔ Payment Successful</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order ID:</strong> #%d</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Payment Transaction ID:</strong> %s</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Amount Paid:</strong> ₹%.2f</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Payment Status:</strong> <span style="color: #10b981; font-weight: bold;">SUCCESS (PAID)</span></p>
                    </div>
                    """,
                        order.getId(),
                        paymentIdStr,
                        amount
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "PAYMENT_SUCCESS (#" + order.getId() + ")");
    }

    // ─── 3. PAYMENT FAILED NOTIFICATION ───────────────────────────────────────────

    @Override
    @Async
    public void sendPaymentFailedEmail(Customer customer, String razorpayOrderId, BigDecimal amount, String failureReason) {
        if (!shouldSend(customer)) return;

        String recipient = customer.getEmail();
        String subject = "Payment Failed - Action Required on Your ShopStack Order";

        String htmlContent = buildEmailTemplate(
                "Payment Failed",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "We were unable to process your payment. Don't worry, your cart items are safe and you can retry checkout.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #f43f5e;">
                      <h3 style="color: #f43f5e; margin-top: 0;">⚠ Payment Attempt Failed</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Razorpay Order Reference:</strong> %s</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Attempted Amount:</strong> ₹%.2f</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Failure Reason:</strong> <span style="color: #f43f5e;">%s</span></p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 15px 0 0 0;">Please log into ShopStack and retry your payment from the cart or checkout page.</p>
                    </div>
                    """,
                        razorpayOrderId != null ? razorpayOrderId : "N/A",
                        amount != null ? amount : BigDecimal.ZERO,
                        failureReason != null ? failureReason : "Payment authorization or signature verification failed."
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "PAYMENT_FAILED (Ref: " + razorpayOrderId + ")");
    }

    // ─── 4. ORDER SHIPPED NOTIFICATION ────────────────────────────────────────────

    @Override
    @Async
    public void sendOrderShippedEmail(Order order, Shipment shipment) {
        if (!shouldSend(order != null ? order.getCustomer() : null)) return;

        Customer customer = order.getCustomer();
        String recipient = customer.getEmail();
        String subject = "Your Order #" + order.getId() + " Has Been Shipped!";

        String trackingId = shipment != null && shipment.getTrackingId() != null ? shipment.getTrackingId() : "N/A";
        String carrier = shipment != null && shipment.getCarrier() != null ? shipment.getCarrier() : "ShopStack Express";

        String htmlContent = buildEmailTemplate(
                "Shipment Update",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "Great news! Your package is on its way. Track your order status below.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #3b82f6;">
                      <h3 style="color: #3b82f6; margin-top: 0;">🚚 Order Shipped</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order ID:</strong> #%d</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Carrier Partner:</strong> %s</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Tracking Number:</strong> <span style="color: #6366f1; font-weight: bold;">%s</span></p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Current Status:</strong> <span style="color: #3b82f6; font-weight: bold;">SHIPPED</span></p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Delivery Address:</strong> %s</p>
                    </div>
                    """,
                        order.getId(),
                        carrier,
                        trackingId,
                        order.getShippingAddress() != null ? order.getShippingAddress() : "Registered Address"
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "ORDER_SHIPPED (#" + order.getId() + ")");
    }

    // ─── 5. ORDER DELIVERED NOTIFICATION ──────────────────────────────────────────

    @Override
    @Async
    public void sendOrderDeliveredEmail(Order order, Shipment shipment) {
        if (!shouldSend(order != null ? order.getCustomer() : null)) return;

        Customer customer = order.getCustomer();
        String recipient = customer.getEmail();
        String subject = "Order Delivered - ShopStack Order #" + order.getId();

        String htmlContent = buildEmailTemplate(
                "Delivery Confirmation",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "Your package for Order #" + order.getId() + " has been successfully delivered! We hope you enjoy your purchase.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #10b981;">
                      <h3 style="color: #10b981; margin-top: 0;">🎉 Package Delivered</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order ID:</strong> #%d</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">DELIVERED</span></p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Delivered To:</strong> %s</p>
                    </div>
                    """,
                        order.getId(),
                        order.getShippingAddress() != null ? order.getShippingAddress() : "Registered Address"
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "ORDER_DELIVERED (#" + order.getId() + ")");
    }

    // ─── 6. REFUND COMPLETED NOTIFICATION ─────────────────────────────────────────

    @Override
    @Async
    public void sendRefundCompletedEmail(Order order, ReturnRequest returnRequest) {
        if (!shouldSend(order != null ? order.getCustomer() : null)) return;

        Customer customer = order.getCustomer();
        String recipient = customer.getEmail();
        String subject = "Refund Processed - ShopStack Order #" + order.getId();

        BigDecimal refundAmt = returnRequest != null && returnRequest.getRefundAmount() != null
                ? returnRequest.getRefundAmount()
                : (order != null ? order.getTotalAmount() : BigDecimal.ZERO);

        String rzpRefundId = returnRequest != null && returnRequest.getRazorpayRefundId() != null
                ? returnRequest.getRazorpayRefundId()
                : "N/A";

        String htmlContent = buildEmailTemplate(
                "Refund Completed",
                "Hi " + (customer.getName() != null ? customer.getName() : "Valued Customer") + ",",
                "Your refund has been successfully processed and credited to your original payment method.",
                String.format("""
                    <div style="background-color: #0f172a; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #14b8a6;">
                      <h3 style="color: #14b8a6; margin-top: 0;">💸 Refund Confirmation</h3>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Order ID:</strong> #%d</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Refund Amount:</strong> ₹%.2f</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Razorpay Refund Reference ID:</strong> %s</p>
                      <p style="color: #94a3b8; font-size: 14px; margin: 4px 0;"><strong>Refund Status:</strong> <span style="color: #14b8a6; font-weight: bold;">REFUNDED</span></p>
                    </div>
                    """,
                        order.getId(),
                        refundAmt,
                        rzpRefundId
                )
        );

        sendEmailHtml(recipient, subject, htmlContent, "REFUND_COMPLETED (#" + order.getId() + ")");
    }

    // ─── PRIVATE HELPER METHODS ───────────────────────────────────────────────────

    private boolean shouldSend(Customer customer) {
        if (!notificationEnabled) {
            logger.info("Notification Module is disabled via configuration (app.notification.enabled=false). Skipping email dispatch.");
            return false;
        }
        if (customer == null || customer.getEmail() == null || customer.getEmail().isBlank()) {
            logger.warn("Cannot send notification email: Customer or email is missing.");
            return false;
        }
        return true;
    }

    private void sendEmailHtml(String to, String subject, String bodyHtml, String eventTag) {
        if (mailSender == null) {
            logger.warn("[{}] JavaMailSender bean is not configured/available. Email sending skipped for recipient: {}", eventTag, to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(bodyHtml, true);

            mailSender.send(message);
            logger.info("[{}] Notification email successfully sent to {}", eventTag, to);
        } catch (Exception e) {
            // CRITICAL REQUIREMENT: Catch all SMTP/network/credential exceptions so workflow never breaks
            logger.error("[{}] Failed to send notification email to {}: {}", eventTag, to, e.getMessage(), e);
        }
    }

    private String buildEmailTemplate(String bannerTitle, String greeting, String bodyText, String contentCardHtml) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>ShopStack Notification</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #f8fafc;">
              <table role="presentation" style="width: 100%%; border-collapse: collapse; background-color: #020617; padding: 20px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" style="width: 100%%; max-width: 600px; border-collapse: collapse; background-color: #0f172a; border-radius: 16px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);">
                      <!-- Header Banner -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%); padding: 30px 24px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.025em;">ShopStack</h1>
                          <p style="color: #e0e7ff; margin: 6px 0 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">%s</p>
                        </td>
                      </tr>
                      <!-- Content Body -->
                      <tr>
                        <td style="padding: 30px 24px;">
                          <p style="font-size: 16px; font-weight: 600; color: #f8fafc; margin-top: 0;">%s</p>
                          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">%s</p>
                          
                          %s
                          
                          <p style="font-size: 13px; color: #64748b; margin-top: 25px; line-height: 1.5;">
                            If you have any questions or require support, please contact our 24/7 Customer Care team.
                          </p>
                        </td>
                      </tr>
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #020617; border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center;">
                          <p style="font-size: 12px; color: #64748b; margin: 0;">&copy; 2026 ShopStack Enterprise Marketplace. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """, bannerTitle, greeting, bodyText, contentCardHtml);
    }
}
