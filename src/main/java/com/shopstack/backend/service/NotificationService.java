package com.shopstack.backend.service;

import com.shopstack.backend.entity.*;
import com.shopstack.backend.repository.NotificationRepository;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;



    // ==========================================
    // NOTIFY VENDORS
    // ==========================================

    public void notifyVendors(Order order) {

        Set<Long> notifiedVendorIds = new HashSet<>();

        for (OrderItem orderItem : order.getItems()) {

            Product product = orderItem.getProduct();

            User vendor = product.getVendor();

            if (vendor == null) {
                continue;
            }

            if (notifiedVendorIds.contains(vendor.getId())) {
                continue;
            }

            Notification notification = new Notification();

            notification.setUser(vendor);

            notification.setMessage(
                    "New order received! Order #"
                            + order.getId()
                            + " has been placed."
            );

            notification.setRead(false);

            notification.setCreatedAt(
                    LocalDateTime.now()
            );

            notificationRepository.save(notification);

            notifiedVendorIds.add(vendor.getId());
        }
    }


    // ==========================================
    // GET USER NOTIFICATIONS
    // ==========================================

    public List<Notification> getMyNotifications(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user);
    }


    // ==========================================
    // GET UNREAD COUNT
    // ==========================================

    public long getUnreadCount(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        return notificationRepository
                .countByUserAndReadFalse(user);
    }


    // ==========================================
    // MARK AS READ
    // ==========================================

    public void markAsRead(
            Long notificationId,
            String email
    ) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );


        // Security check:
        // A vendor must only be able to modify
        // their own notification.

        if (!notification.getUser().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "You are not allowed to modify this notification"
            );
        }


        notification.setRead(true);

        notificationRepository.save(notification);
    }

    // ==========================================
// CUSTOMER - ORDER PLACED EMAIL
// ==========================================

    public void notifyCustomerOrderPlaced(Order order) {

        if (order == null) {
            return;
        }

        User customer = order.getUser();

        if (customer == null ||
                customer.getEmail() == null ||
                customer.getEmail().isBlank()) {

            System.err.println(
                    "ORDER PLACED EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        StringBuilder itemsHtml =
                new StringBuilder();

        for (OrderItem item : order.getItems()) {

            Product product =
                    item.getProduct();

            String productName =
                    product != null
                            ? product.getName()
                            : "Product";

            int quantity =
                    item.getQuantity();

            double price =
                    item.getPrice();

            double subtotal =
                    price * quantity;

            itemsHtml.append(
                    "<tr>"
                            + "<td style='padding:10px;border-bottom:1px solid #eee;'>"
                            + productName
                            + "</td>"
                            + "<td style='padding:10px;border-bottom:1px solid #eee;text-align:center;'>"
                            + quantity
                            + "</td>"
                            + "<td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>₹"
                            + String.format("%.2f", price)
                            + "</td>"
                            + "<td style='padding:10px;border-bottom:1px solid #eee;text-align:right;'>₹"
                            + String.format("%.2f", subtotal)
                            + "</td>"
                            + "</tr>"
            );
        }

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:700px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#2563eb;">
                        Order Placed Successfully!
                    </h2>

                    <p>
                        Thank you for shopping with <strong>ShopStack</strong>.
                        Your order has been successfully placed.
                    </p>

                    <div style="background:#f8fafc;padding:15px;border-radius:8px;margin:20px 0;">
                        <p><strong>Order ID:</strong> #%d</p>
                        <p><strong>Order Date:</strong> %s</p>
                        <p><strong>Order Status:</strong> %s</p>
                    </div>

                    <h3>Order Details</h3>

                    <table style="width:100%%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:#f1f5f9;">
                                <th style="padding:10px;text-align:left;">Product</th>
                                <th style="padding:10px;text-align:center;">Quantity</th>
                                <th style="padding:10px;text-align:right;">Price</th>
                                <th style="padding:10px;text-align:right;">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            %s
                        </tbody>
                    </table>

                    <div style="text-align:right;margin-top:20px;font-size:18px;">
                        <strong>Total Amount: ₹%.2f</strong>
                    </div>

                    <p style="margin-top:30px;">
                        We will notify you when your order status changes.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                order.getId(),
                order.getOrderDate(),
                order.getStatus(),
                itemsHtml,
                order.getTotalAmount()
        );

        emailService.sendHtmlEmail(
                customer.getEmail(),
                "ShopStack Order Confirmation #" + order.getId(),
                htmlBody
        );
    }

    // ==========================================
// CUSTOMER - PAYMENT SUCCESS EMAIL
// ==========================================

    public void notifyCustomerPaymentSuccess(Order order) {

        if (order == null) {
            return;
        }

        User customer = order.getUser();

        if (customer == null ||
                customer.getEmail() == null ||
                customer.getEmail().isBlank()) {

            System.err.println(
                    "PAYMENT SUCCESS EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        String paymentId =
                order.getRazorpayPaymentId() != null
                        ? order.getRazorpayPaymentId()
                        : "N/A";

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#16a34a;">
                        Payment Successful
                    </h2>

                    <p>
                        Your payment for ShopStack order
                        <strong>#%d</strong>
                        was successfully processed.
                    </p>

                    <div style="background:#f8fafc;padding:18px;border-radius:8px;margin:20px 0;">

                        <p>
                            <strong>Order ID:</strong> #%d
                        </p>

                        <p>
                            <strong>Payment ID:</strong> %s
                        </p>

                        <p>
                            <strong>Amount:</strong> ₹%.2f
                        </p>

                        <p>
                            <strong>Payment Status:</strong> %s
                        </p>

                    </div>

                    <p>
                        Thank you for shopping with ShopStack.
                    </p>

                    <p>
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                order.getId(),
                order.getId(),
                paymentId,
                order.getTotalAmount(),
                order.getPaymentStatus()
        );

        emailService.sendHtmlEmail(
                customer.getEmail(),
                "ShopStack Payment Successful - Order #" + order.getId(),
                htmlBody
        );
    }

    // ==========================================
// CUSTOMER - PAYMENT FAILED EMAIL
// ==========================================

    public void notifyCustomerPaymentFailed(
            String customerEmail,
            String razorpayOrderId,
            Double amount,
            String errorDescription,
            String errorReason
    ) {

        if (customerEmail == null ||
                customerEmail.isBlank()) {

            System.err.println(
                    "PAYMENT FAILED EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        String orderId =
                razorpayOrderId != null &&
                        !razorpayOrderId.isBlank()
                        ? razorpayOrderId
                        : "N/A";

        String failureReason =
                errorDescription != null &&
                        !errorDescription.isBlank()
                        ? errorDescription
                        : (
                        errorReason != null &&
                                !errorReason.isBlank()
                                ? errorReason
                                : "Payment could not be completed"
                );

        double paymentAmount =
                amount != null
                        ? amount
                        : 0.0;

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#dc2626;">
                        Payment Failed
                    </h2>

                    <p>
                        Unfortunately, your payment for your ShopStack order
                        could not be completed.
                    </p>

                    <div style="background:#fef2f2;padding:18px;border-radius:8px;margin:20px 0;">

                        <p>
                            <strong>Razorpay Order ID:</strong> %s
                        </p>

                        <p>
                            <strong>Amount:</strong> ₹%.2f
                        </p>

                        <p>
                            <strong>Payment Status:</strong> FAILED
                        </p>

                        <p>
                            <strong>Reason:</strong> %s
                        </p>

                    </div>

                    <p>
                        No successful payment was recorded for this transaction.
                    </p>

                    <p>
                        Please try again or use another payment method.
                    </p>

                    <p style="margin-top:30px;">
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                orderId,
                paymentAmount,
                failureReason
        );

        emailService.sendHtmlEmail(
                customerEmail,
                "ShopStack Payment Failed",
                htmlBody
        );
    }

    // ==========================================
// CUSTOMER - ORDER SHIPPED EMAIL
// ==========================================

    public void notifyCustomerOrderShipped(Order order) {

        if (order == null) {
            return;
        }

        User customer = order.getUser();

        if (customer == null ||
                customer.getEmail() == null ||
                customer.getEmail().isBlank()) {

            System.err.println(
                    "ORDER SHIPPED EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        String trackingInfo =
                order.getRazorpayOrderId() != null
                        ? order.getRazorpayOrderId()
                        : "Tracking information will be updated soon";

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#2563eb;">
                        Your Order Has Been Shipped!
                    </h2>

                    <p>
                        Great news! Your ShopStack order
                        <strong>#%d</strong>
                        has been shipped.
                    </p>

                    <div style="background:#eff6ff;padding:18px;border-radius:8px;margin:20px 0;">

                        <p>
                            <strong>Order ID:</strong> #%d
                        </p>

                        <p>
                            <strong>Current Status:</strong> SHIPPED
                        </p>

                        <p>
                            <strong>Shipment / Tracking Information:</strong>
                            %s
                        </p>

                    </div>

                    <p>
                        Your order is now on its way.
                    </p>

                    <p style="margin-top:30px;">
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                order.getId(),
                order.getId(),
                trackingInfo
        );

        emailService.sendHtmlEmail(
                customer.getEmail(),
                "ShopStack Order Shipped - Order #" + order.getId(),
                htmlBody
        );
    }

    // ==========================================
// CUSTOMER - ORDER DELIVERED EMAIL
// ==========================================

    public void notifyCustomerOrderDelivered(Order order) {

        if (order == null) {
            return;
        }

        User customer = order.getUser();

        if (customer == null ||
                customer.getEmail() == null ||
                customer.getEmail().isBlank()) {

            System.err.println(
                    "ORDER DELIVERED EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        String deliveredAt =
                order.getDeliveredAt() != null
                        ? order.getDeliveredAt().toString()
                        : "Delivery completed";

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#16a34a;">
                        Your Order Has Been Delivered!
                    </h2>

                    <p>
                        Your ShopStack order
                        <strong>#%d</strong>
                        has been successfully delivered.
                    </p>

                    <div style="background:#f0fdf4;padding:18px;border-radius:8px;margin:20px 0;">

                        <p>
                            <strong>Order ID:</strong> #%d
                        </p>

                        <p>
                            <strong>Current Status:</strong> DELIVERED
                        </p>

                        <p>
                            <strong>Delivered At:</strong> %s
                        </p>

                    </div>

                    <p>
                        Thank you for shopping with ShopStack.
                        We hope you enjoyed your purchase!
                    </p>

                    <p style="margin-top:30px;">
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                order.getId(),
                order.getId(),
                deliveredAt
        );

        emailService.sendHtmlEmail(
                customer.getEmail(),
                "ShopStack Order Delivered - Order #" + order.getId(),
                htmlBody
        );
    }

    // ==========================================
// CUSTOMER - REFUND COMPLETED EMAIL
// ==========================================

    public void notifyCustomerRefundCompleted(
            ReturnRequest request
    ) {

        if (request == null) {
            return;
        }

        User customer = request.getCustomer();

        if (customer == null ||
                customer.getEmail() == null ||
                customer.getEmail().isBlank()) {

            System.err.println(
                    "REFUND COMPLETED EMAIL SKIPPED: customer email unavailable"
            );

            return;
        }

        Order order = request.getOrder();

        Long orderId =
                order != null
                        ? order.getId()
                        : null;

        double refundAmount =
                request.getRefundAmount() != null
                        ? request.getRefundAmount()
                        : 0.0;

        String refundId =
                request.getRefundId() != null &&
                        !request.getRefundId().isBlank()
                        ? request.getRefundId()
                        : "N/A";

        String htmlBody = """
            <html>
            <body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px;">

                <div style="max-width:650px;margin:auto;background:white;padding:30px;border-radius:10px;">

                    <h2 style="color:#16a34a;">
                        Refund Completed
                    </h2>

                    <p>
                        Your refund for ShopStack order
                        <strong>#%s</strong>
                        has been successfully completed.
                    </p>

                    <div style="background:#f0fdf4;padding:18px;border-radius:8px;margin:20px 0;">

                        <p>
                            <strong>Order ID:</strong> #%s
                        </p>

                        <p>
                            <strong>Refund Amount:</strong> ₹%.2f
                        </p>

                        <p>
                            <strong>Refund Status:</strong> COMPLETED
                        </p>

                        <p>
                            <strong>Refund ID:</strong> %s
                        </p>

                    </div>

                    <p>
                        The refund has been successfully processed.
                    </p>

                    <p>
                        Please allow your payment provider's standard
                        processing time for the amount to appear in your account.
                    </p>

                    <p style="margin-top:30px;">
                        Regards,<br>
                        <strong>ShopStack Team</strong>
                    </p>

                </div>

            </body>
            </html>
            """.formatted(
                orderId != null ? orderId : "N/A",
                orderId != null ? orderId : "N/A",
                refundAmount,
                refundId
        );

        emailService.sendHtmlEmail(
                customer.getEmail(),
                "ShopStack Refund Completed - Order #" +
                        (orderId != null ? orderId : "N/A"),
                htmlBody
        );
    }

}