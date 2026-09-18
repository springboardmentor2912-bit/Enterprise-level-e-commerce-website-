package com.shopstack.service;

import com.shopstack.model.Order;
import com.shopstack.model.OrderItem;
import com.shopstack.model.Payment;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailTemplateService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    // ==========================================
    // 1. ORDER PLACED TEMPLATE
    // ==========================================
    public EmailContent buildOrderPlacedEmail(Order order) {
        String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();
        String customerName = order.getCustomer() != null && order.getCustomer().getFullName() != null 
                ? order.getCustomer().getFullName() : "Valued Customer";
        String orderDate = order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMATTER) : LocalDateTime.now().format(DATE_FORMATTER);
        String shippingAddress = order.getShippingAddress() != null ? order.getShippingAddress() : "Address on file";

        StringBuilder itemsTable = new StringBuilder();
        StringBuilder itemsText = new StringBuilder();

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String title = item.getProduct() != null ? item.getProduct().getTitle() : "Item";
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                double unitPrice = item.getUnitPrice() != null ? item.getUnitPrice() : 0.0;
                double subtotal = item.getSubtotal() != null ? item.getSubtotal() : (unitPrice * qty);

                itemsTable.append("<tr>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;'>")
                        .append("<strong>").append(escapeHtml(title)).append("</strong>")
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; color: #64748b;'>")
                        .append(qty)
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; color: #64748b;'>")
                        .append("₹").append(String.format("%.2f", unitPrice))
                        .append("</td>")
                        .append("<td style='padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;'>")
                        .append("₹").append(String.format("%.2f", subtotal))
                        .append("</td>")
                        .append("</tr>");

                itemsText.append("- ").append(title)
                        .append(" | Qty: ").append(qty)
                        .append(" | Price: ₹").append(String.format("%.2f", unitPrice))
                        .append(" | Subtotal: ₹").append(String.format("%.2f", subtotal))
                        .append("\n");
            }
        }

        double subtotalAmount = order.getSubtotalAmount() != null ? order.getSubtotalAmount() : order.getTotalAmount();
        double discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0;
        double totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;

        String html = getBaseHtmlTemplate(
                "Order Confirmation",
                "#10b981",
                "🎉 Thank you for your order, " + escapeHtml(customerName) + "!",
                "Your order <strong>#" + escapeHtml(orderNumber) + "</strong> has been placed successfully and is being processed by our merchants and fulfillment centers.",
                "<div style='background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #334155;'>" +
                        "<tr><td><strong>Order ID:</strong></td><td style='text-align: right;'>" + escapeHtml(orderNumber) + "</td></tr>" +
                        "<tr><td><strong>Order Date:</strong></td><td style='text-align: right;'>" + orderDate + "</td></tr>" +
                        "<tr><td><strong>Order Status:</strong></td><td style='text-align: right;'><span style='background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 9999px; font-weight: 600; font-size: 12px;'>" + order.getStatus() + "</span></td></tr>" +
                        "<tr><td><strong>Payment Method:</strong></td><td style='text-align: right;'>" + order.getPaymentMethod() + "</td></tr>" +
                        "<tr><td><strong>Shipping Address:</strong></td><td style='text-align: right;'>" + escapeHtml(shippingAddress) + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        "<h3 style='margin: 0 0 12px; font-size: 16px; color: #0f172a;'>Order Summary</h3>" +
                        "<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>" +
                        "<thead><tr style='background: #f1f5f9; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase;'>" +
                        "<th style='padding: 10px 12px;'>Item</th><th style='padding: 10px 12px; text-align: center;'>Qty</th><th style='padding: 10px 12px; text-align: right;'>Price</th><th style='padding: 10px 12px; text-align: right;'>Total</th>" +
                        "</tr></thead>" +
                        "<tbody>" + itemsTable + "</tbody>" +
                        "</table>" +
                        "<div style='border-top: 2px dashed #cbd5e1; padding-top: 16px; margin-top: 16px;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #475569;'>" +
                        "<tr><td>Subtotal:</td><td style='text-align: right;'>₹" + String.format("%.2f", subtotalAmount) + "</td></tr>" +
                        (discount > 0 ? "<tr><td style='color: #16a34a;'>Coupon Discount (" + (order.getCouponCode() != null ? order.getCouponCode() : "") + "):</td><td style='text-align: right; color: #16a34a;'>-₹" + String.format("%.2f", discount) + "</td></tr>" : "") +
                        "<tr><td style='font-size: 18px; font-weight: 700; color: #0f172a; padding-top: 8px;'>Total Amount:</td><td style='font-size: 18px; font-weight: 700; color: #2563eb; text-align: right; padding-top: 8px;'>₹" + String.format("%.2f", totalAmount) + "</td></tr>" +
                        "</table>" +
                        "</div>"
        );

        String text = "ShopStack - Order Placed Successfully\n" +
                "====================================\n" +
                "Thank you for your order, " + customerName + "!\n\n" +
                "Order ID: " + orderNumber + "\n" +
                "Order Date: " + orderDate + "\n" +
                "Order Status: " + order.getStatus() + "\n" +
                "Payment Method: " + order.getPaymentMethod() + "\n" +
                "Shipping Address: " + shippingAddress + "\n\n" +
                "Items Ordered:\n" + itemsText + "\n" +
                "Subtotal: ₹" + String.format("%.2f", subtotalAmount) + "\n" +
                (discount > 0 ? "Discount: -₹" + String.format("%.2f", discount) + "\n" : "") +
                "Total Amount: ₹" + String.format("%.2f", totalAmount) + "\n\n" +
                "Track your orders anytime on your ShopStack Dashboard.\n";

        return new EmailContent("Order Confirmation: #" + orderNumber, html, text);
    }

    // ==========================================
    // 2a. PAYMENT SUCCESSFUL TEMPLATE
    // ==========================================
    public EmailContent buildPaymentSuccessEmail(Payment payment, List<Order> orders) {
        String paymentId = payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : ("PAY-" + payment.getId());
        String customerName = payment.getCustomer() != null && payment.getCustomer().getFullName() != null 
                ? payment.getCustomer().getFullName() : "Customer";
        String date = payment.getUpdatedAt() != null ? payment.getUpdatedAt().format(DATE_FORMATTER) : LocalDateTime.now().format(DATE_FORMATTER);
        double amount = payment.getAmount() != null ? payment.getAmount() : 0.0;
        String currency = payment.getCurrency() != null ? payment.getCurrency() : "INR";

        StringBuilder ordersListHtml = new StringBuilder();
        StringBuilder ordersListText = new StringBuilder();

        if (orders != null && !orders.isEmpty()) {
            ordersListHtml.append("<div style='background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 20px; border: 1px solid #e2e8f0;'>")
                    .append("<strong style='color: #334155; font-size: 14px;'>Associated Order Numbers:</strong><ul style='margin: 8px 0 0; padding-left: 20px; color: #475569; font-size: 14px;'>");
            for (Order o : orders) {
                ordersListHtml.append("<li><strong>").append(escapeHtml(o.getOrderNumber())).append("</strong> (₹").append(String.format("%.2f", o.getTotalAmount())).append(")</li>");
                ordersListText.append("- Order #").append(o.getOrderNumber()).append(" (₹").append(String.format("%.2f", o.getTotalAmount())).append(")\n");
            }
            ordersListHtml.append("</ul></div>");
        }

        String html = getBaseHtmlTemplate(
                "Payment Received",
                "#2563eb",
                "💳 Payment Successful!",
                "Hello " + escapeHtml(customerName) + ", your payment of <strong>" + currency + " " + String.format("%.2f", amount) + "</strong> has been successfully processed and verified.",
                "<div style='background: #eff6ff; border-radius: 8px; padding: 18px; margin-bottom: 20px; border: 1px solid #bfdbfe;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #1e3a8a;'>" +
                        "<tr><td><strong>Payment Status:</strong></td><td style='text-align: right;'><span style='background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 12px;'>SUCCESS / PAID</span></td></tr>" +
                        "<tr><td><strong>Transaction / Payment ID:</strong></td><td style='text-align: right; font-family: monospace; font-weight: 600;'>" + escapeHtml(paymentId) + "</td></tr>" +
                        "<tr><td><strong>Amount Paid:</strong></td><td style='text-align: right; font-weight: 700; font-size: 16px; color: #2563eb;'>₹" + String.format("%.2f", amount) + "</td></tr>" +
                        "<tr><td><strong>Payment Gateway / Method:</strong></td><td style='text-align: right;'>" + payment.getPaymentMethod() + "</td></tr>" +
                        "<tr><td><strong>Payment Date:</strong></td><td style='text-align: right;'>" + date + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        ordersListHtml
        );

        String text = "ShopStack - Payment Received\n" +
                "============================\n" +
                "Hello " + customerName + ",\n\n" +
                "Your payment was processed successfully.\n\n" +
                "Payment ID: " + paymentId + "\n" +
                "Payment Status: SUCCESS / PAID\n" +
                "Amount Paid: " + currency + " " + String.format("%.2f", amount) + "\n" +
                "Payment Method: " + payment.getPaymentMethod() + "\n" +
                "Date: " + date + "\n\n" +
                (ordersListText.length() > 0 ? "Orders:\n" + ordersListText + "\n" : "") +
                "Thank you for shopping with ShopStack!";

        return new EmailContent("Payment Confirmation: " + paymentId + " [SUCCESS]", html, text);
    }

    // ==========================================
    // 2b. PAYMENT FAILED TEMPLATE
    // ==========================================
    public EmailContent buildPaymentFailedEmail(Payment payment, String failureReason) {
        String razorpayOrderId = payment.getRazorpayOrderId() != null ? payment.getRazorpayOrderId() : "N/A";
        String customerName = payment.getCustomer() != null && payment.getCustomer().getFullName() != null 
                ? payment.getCustomer().getFullName() : "Customer";
        String date = payment.getUpdatedAt() != null ? payment.getUpdatedAt().format(DATE_FORMATTER) : LocalDateTime.now().format(DATE_FORMATTER);
        double amount = payment.getAmount() != null ? payment.getAmount() : 0.0;
        String reason = failureReason != null ? failureReason : (payment.getFailureReason() != null ? payment.getFailureReason() : "Transaction declined by issuing bank or gateway timeout.");

        String html = getBaseHtmlTemplate(
                "Payment Alert",
                "#ef4444",
                "⚠️ Payment Attempt Failed",
                "Hello " + escapeHtml(customerName) + ", we were unable to process your payment for transaction <strong>#" + escapeHtml(razorpayOrderId) + "</strong>.",
                "<div style='background: #fef2f2; border-radius: 8px; padding: 18px; margin-bottom: 20px; border: 1px solid #fecaca;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #7f1d1d;'>" +
                        "<tr><td><strong>Payment Status:</strong></td><td style='text-align: right;'><span style='background: #fee2e2; color: #b91c1c; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 12px;'>FAILED</span></td></tr>" +
                        "<tr><td><strong>Order / Reference ID:</strong></td><td style='text-align: right; font-family: monospace;'>" + escapeHtml(razorpayOrderId) + "</td></tr>" +
                        "<tr><td><strong>Attempted Amount:</strong></td><td style='text-align: right; font-weight: 700;'>₹" + String.format("%.2f", amount) + "</td></tr>" +
                        "<tr><td><strong>Reason:</strong></td><td style='text-align: right; color: #dc2626; font-weight: 600;'>" + escapeHtml(reason) + "</td></tr>" +
                        "<tr><td><strong>Timestamp:</strong></td><td style='text-align: right;'>" + date + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 14px; line-height: 1.6;'>" +
                        "No funds have been debited from your account. If amount was deducted, banks typically auto-refund within 3-5 business days. " +
                        "You can easily retry payment through your ShopStack checkout screen or try an alternate payment method (e.g. UPI, NetBanking, or COD)." +
                        "</p>"
        );

        String text = "ShopStack - Payment Failed Alert\n" +
                "================================\n" +
                "Hello " + customerName + ",\n\n" +
                "Your payment attempt could not be completed.\n\n" +
                "Reference ID: " + razorpayOrderId + "\n" +
                "Status: FAILED\n" +
                "Attempted Amount: ₹" + String.format("%.2f", amount) + "\n" +
                "Failure Reason: " + reason + "\n" +
                "Timestamp: " + date + "\n\n" +
                "Please visit ShopStack to retry your payment or select another payment option.\n";

        return new EmailContent("Action Required: Payment Failed for Reference #" + razorpayOrderId, html, text);
    }

    // ==========================================
    // 3. ORDER SHIPPED TEMPLATE
    // ==========================================
    public EmailContent buildOrderShippedEmail(Order order, String carrier, String trackingNumber) {
        String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();
        String customerName = order.getCustomer() != null && order.getCustomer().getFullName() != null 
                ? order.getCustomer().getFullName() : "Valued Customer";
        String carrierName = carrier != null && !carrier.isBlank() ? carrier : "BlueDart Express / ShopStack Logistics";
        String trackingNum = trackingNumber != null && !trackingNumber.isBlank() ? trackingNumber : "TRK-IN-" + order.getId() + "890";
        String shippingAddress = order.getShippingAddress() != null ? order.getShippingAddress() : "Destination address on file";
        String dispatchDate = LocalDateTime.now().format(DATE_FORMATTER);

        String html = getBaseHtmlTemplate(
                "Shipment Update",
                "#0284c7",
                "🚚 Your Order is on the Way!",
                "Great news " + escapeHtml(customerName) + "! Your order <strong>#" + escapeHtml(orderNumber) + "</strong> has been packed and handed over to our delivery partner.",
                "<div style='background: #f0f9ff; border-radius: 8px; padding: 18px; margin-bottom: 20px; border: 1px solid #bae6fd;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #0369a1;'>" +
                        "<tr><td><strong>Order ID:</strong></td><td style='text-align: right; font-weight: 600;'>" + escapeHtml(orderNumber) + "</td></tr>" +
                        "<tr><td><strong>Current Status:</strong></td><td style='text-align: right;'><span style='background: #e0f2fe; color: #0284c7; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 12px;'>SHIPPED</span></td></tr>" +
                        "<tr><td><strong>Carrier / Courier:</strong></td><td style='text-align: right; font-weight: 600;'>" + escapeHtml(carrierName) + "</td></tr>" +
                        "<tr><td><strong>Tracking Number (AWB):</strong></td><td style='text-align: right; font-family: monospace; font-weight: 700; color: #0284c7;'>" + escapeHtml(trackingNum) + "</td></tr>" +
                        "<tr><td><strong>Dispatch Date:</strong></td><td style='text-align: right;'>" + dispatchDate + "</td></tr>" +
                        "<tr><td><strong>Delivering To:</strong></td><td style='text-align: right;'>" + escapeHtml(shippingAddress) + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 14px; line-height: 1.6;'>" +
                        "You can track live delivery progress directly from your ShopStack order history." +
                        "</p>"
        );

        String text = "ShopStack - Order Shipped\n" +
                "=========================\n" +
                "Hello " + customerName + ",\n\n" +
                "Your order #" + orderNumber + " is on its way!\n\n" +
                "Order Status: SHIPPED\n" +
                "Courier Partner: " + carrierName + "\n" +
                "Tracking Number: " + trackingNum + "\n" +
                "Dispatch Date: " + dispatchDate + "\n" +
                "Delivering to: " + shippingAddress + "\n\n" +
                "Thank you for shopping with ShopStack.\n";

        return new EmailContent("Your Order #" + orderNumber + " Has Been Shipped! [Tracking: " + trackingNum + "]", html, text);
    }

    // ==========================================
    // 4. ORDER DELIVERED TEMPLATE
    // ==========================================
    public EmailContent buildOrderDeliveredEmail(Order order) {
        String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();
        String customerName = order.getCustomer() != null && order.getCustomer().getFullName() != null 
                ? order.getCustomer().getFullName() : "Valued Customer";
        String deliveryDate = LocalDateTime.now().format(DATE_FORMATTER);
        String shippingAddress = order.getShippingAddress() != null ? order.getShippingAddress() : "Address on file";

        String html = getBaseHtmlTemplate(
                "Delivery Confirmation",
                "#16a34a",
                "📦 Order Delivered Successfully!",
                "Hello " + escapeHtml(customerName) + ", your package for order <strong>#" + escapeHtml(orderNumber) + "</strong> has been successfully delivered.",
                "<div style='background: #f0fdf4; border-radius: 8px; padding: 18px; margin-bottom: 20px; border: 1px solid #bbf7d0;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #166534;'>" +
                        "<tr><td><strong>Order ID:</strong></td><td style='text-align: right; font-weight: 600;'>" + escapeHtml(orderNumber) + "</td></tr>" +
                        "<tr><td><strong>Status:</strong></td><td style='text-align: right;'><span style='background: #dcfce7; color: #15803d; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 12px;'>DELIVERED</span></td></tr>" +
                        "<tr><td><strong>Delivered At:</strong></td><td style='text-align: right;'>" + deliveryDate + "</td></tr>" +
                        "<tr><td><strong>Delivery Address:</strong></td><td style='text-align: right;'>" + escapeHtml(shippingAddress) + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 14px; line-height: 1.6;'>" +
                        "We hope you enjoy your purchase! Please take a moment to leave a review and rating on ShopStack." +
                        "</p>"
        );

        String text = "ShopStack - Order Delivered\n" +
                "===========================\n" +
                "Hello " + customerName + ",\n\n" +
                "Your package for order #" + orderNumber + " has been delivered.\n\n" +
                "Status: DELIVERED\n" +
                "Delivered Date & Time: " + deliveryDate + "\n" +
                "Delivery Address: " + shippingAddress + "\n\n" +
                "We hope you enjoy your items! Leave a review on ShopStack.\n";

        return new EmailContent("Delivered: Order #" + orderNumber + " was delivered successfully!", html, text);
    }

    // ==========================================
    // 5. REFUND COMPLETED TEMPLATE
    // ==========================================
    public EmailContent buildRefundCompletedEmail(Order order, Double refundAmount, String refundNotes) {
        String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();
        String customerName = order.getCustomer() != null && order.getCustomer().getFullName() != null 
                ? order.getCustomer().getFullName() : "Valued Customer";
        double amount = refundAmount != null ? refundAmount : (order.getTotalAmount() != null ? order.getTotalAmount() : 0.0);
        String date = LocalDateTime.now().format(DATE_FORMATTER);
        String notes = refundNotes != null && !refundNotes.isBlank() ? refundNotes : "Return quality check passed. Refund credited to original payment source.";

        String html = getBaseHtmlTemplate(
                "Refund Notification",
                "#8b5cf6",
                "💰 Refund Processed Successfully",
                "Hello " + escapeHtml(customerName) + ", a refund of <strong>₹" + String.format("%.2f", amount) + "</strong> for order <strong>#" + escapeHtml(orderNumber) + "</strong> has been successfully processed.",
                "<div style='background: #f5f3ff; border-radius: 8px; padding: 18px; margin-bottom: 20px; border: 1px solid #ddd6fe;'>" +
                        "<table style='width: 100%; font-size: 14px; color: #5b21b6;'>" +
                        "<tr><td><strong>Order ID:</strong></td><td style='text-align: right; font-weight: 600;'>" + escapeHtml(orderNumber) + "</td></tr>" +
                        "<tr><td><strong>Refund Status:</strong></td><td style='text-align: right;'><span style='background: #ede9fe; color: #7c3aed; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 12px;'>REFUND COMPLETED</span></td></tr>" +
                        "<tr><td><strong>Refund Amount:</strong></td><td style='text-align: right; font-weight: 700; font-size: 16px; color: #7c3aed;'>₹" + String.format("%.2f", amount) + "</td></tr>" +
                        "<tr><td><strong>Date Processed:</strong></td><td style='text-align: right;'>" + date + "</td></tr>" +
                        "<tr><td><strong>Notes / Info:</strong></td><td style='text-align: right;'>" + escapeHtml(notes) + "</td></tr>" +
                        "</table>" +
                        "</div>" +
                        "<p style='color: #475569; font-size: 14px; line-height: 1.6;'>" +
                        "Depending on your bank/card issuer, the refund credit will reflect on your statement within 3 to 7 business days." +
                        "</p>"
        );

        String text = "ShopStack - Refund Completed\n" +
                "============================\n" +
                "Hello " + customerName + ",\n\n" +
                "Your refund for order #" + orderNumber + " has been processed.\n\n" +
                "Refund Status: COMPLETED / REFUNDED\n" +
                "Refund Amount: ₹" + String.format("%.2f", amount) + "\n" +
                "Date Processed: " + date + "\n" +
                "Details: " + notes + "\n\n" +
                "Funds typically reflect on your bank/card statement within 3-7 business days.\n";

        return new EmailContent("Refund Processed: ₹" + String.format("%.2f", amount) + " for Order #" + orderNumber, html, text);
    }

    // ==========================================
    // BASE HTML TEMPLATE GENERATOR
    // ==========================================
    private String getBaseHtmlTemplate(String categoryHeader, String accentColor, String heroTitle, String heroSubtitle, String contentSection) {
        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head>" +
                "<body style='margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;'>" +
                "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color: #f1f5f9; padding: 30px 10px;'>" +
                "<tr><td align='center'>" +
                "<table role='presentation' width='100%' style='max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);'>" +
                // Brand Header
                "<tr><td style='background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center;'>" +
                "<h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;'>Shop<span style='color: " + accentColor + ";'>Stack</span></h1>" +
                "<p style='margin: 4px 0 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;'>" + escapeHtml(categoryHeader) + "</p>" +
                "</td></tr>" +
                // Body Card
                "<tr><td style='padding: 32px 28px;'>" +
                "<h2 style='margin: 0 0 12px; color: #0f172a; font-size: 20px; font-weight: 700;'>" + heroTitle + "</h2>" +
                "<p style='margin: 0 0 24px; color: #475569; font-size: 15px; line-height: 1.5;'>" + heroSubtitle + "</p>" +
                contentSection +
                // Action CTA
                "<div style='margin-top: 30px; text-align: center;'>" +
                "<a href='http://localhost:5173' style='display: inline-block; background-color: " + accentColor + "; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px;'>Open ShopStack Dashboard</a>" +
                "</div>" +
                "</td></tr>" +
                // Footer
                "<tr><td style='background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;'>" +
                "<p style='margin: 0 0 6px;'>© " + LocalDateTime.now().getYear() + " ShopStack Enterprise Multi-Vendor Platform. All rights reserved.</p>" +
                "<p style='margin: 0;'>This is an automated real-time notification sent to your registered account email.</p>" +
                "</td></tr>" +
                "</table>" +
                "</td></tr>" +
                "</table>" +
                "</body></html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    public static class EmailContent {
        private final String subject;
        private final String bodyHtml;
        private final String bodyText;

        public EmailContent(String subject, String bodyHtml, String bodyText) {
            this.subject = subject;
            this.bodyHtml = bodyHtml;
            this.bodyText = bodyText;
        }

        public String getSubject() { return subject; }
        public String getBodyHtml() { return bodyHtml; }
        public String getBodyText() { return bodyText; }
    }
}
