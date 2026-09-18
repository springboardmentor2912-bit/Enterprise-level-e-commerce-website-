package com.shopstack.service;

import com.shopstack.model.*;
import com.shopstack.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;

    public NotificationService(NotificationRepository notificationRepository,
                               EmailService emailService,
                               EmailTemplateService emailTemplateService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        this.emailTemplateService = emailTemplateService;
    }

    // ==========================================
    // 1. ORDER PLACED NOTIFICATION
    // ==========================================
    public void sendOrderPlacedNotification(Order order) {
        if (order == null || order.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Order Placed notification: Order or customer is null.");
            return;
        }

        try {
            User customer = order.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();

            EmailTemplateService.EmailContent content = emailTemplateService.buildOrderPlacedEmail(order);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.ORDER_PLACED)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(orderNumber)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage("Email dispatch failed or SMTP unreachable.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Order placed notification processed for Order #{} -> Recipient: {}", orderNumber, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Order Placed notification for order ID {}: {}", order.getId(), e.getMessage(), e);
        }
    }

    // ==========================================
    // 2a. PAYMENT SUCCESSFUL NOTIFICATION
    // ==========================================
    public void sendPaymentSuccessNotification(Payment payment, List<Order> orders) {
        if (payment == null || payment.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Payment Success notification: Payment or customer is null.");
            return;
        }

        try {
            User customer = payment.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String paymentRef = payment.getRazorpayPaymentId() != null ? payment.getRazorpayPaymentId() : payment.getRazorpayOrderId();

            EmailTemplateService.EmailContent content = emailTemplateService.buildPaymentSuccessEmail(payment, orders);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.PAYMENT_SUCCESS)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(paymentRef)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage("Payment success email dispatch failed.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Payment success notification processed for Ref: {} -> Recipient: {}", paymentRef, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Payment Success notification: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // 2b. PAYMENT FAILED NOTIFICATION
    // ==========================================
    public void sendPaymentFailedNotification(Payment payment, String failureReason) {
        if (payment == null || payment.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Payment Failed notification: Payment or customer is null.");
            return;
        }

        try {
            User customer = payment.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String orderRef = payment.getRazorpayOrderId() != null ? payment.getRazorpayOrderId() : ("PAY-" + payment.getId());

            EmailTemplateService.EmailContent content = emailTemplateService.buildPaymentFailedEmail(payment, failureReason);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.PAYMENT_FAILED)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(orderRef)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage(failureReason != null ? failureReason : "Payment failed notification dispatch issue.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Payment failed notification processed for Ref: {} -> Recipient: {}", orderRef, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Payment Failed notification: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // 3. ORDER SHIPPED NOTIFICATION
    // ==========================================
    public void sendOrderShippedNotification(Order order, String carrier, String trackingNumber) {
        if (order == null || order.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Order Shipped notification: Order or customer is null.");
            return;
        }

        try {
            User customer = order.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();

            EmailTemplateService.EmailContent content = emailTemplateService.buildOrderShippedEmail(order, carrier, trackingNumber);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.ORDER_SHIPPED)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(orderNumber)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage("Order shipped email dispatch failed.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Order shipped notification processed for Order #{} -> Recipient: {}", orderNumber, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Order Shipped notification: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // 4. ORDER DELIVERED NOTIFICATION
    // ==========================================
    public void sendOrderDeliveredNotification(Order order) {
        if (order == null || order.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Order Delivered notification: Order or customer is null.");
            return;
        }

        try {
            User customer = order.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();

            EmailTemplateService.EmailContent content = emailTemplateService.buildOrderDeliveredEmail(order);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.ORDER_DELIVERED)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(orderNumber)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage("Order delivered email dispatch failed.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Order delivered notification processed for Order #{} -> Recipient: {}", orderNumber, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Order Delivered notification: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // 5. REFUND COMPLETED NOTIFICATION
    // ==========================================
    public void sendRefundCompletedNotification(Order order, Double refundAmount, String refundNotes) {
        if (order == null || order.getCustomer() == null) {
            logger.warn("[NotificationService] Cannot send Refund Completed notification: Order or customer is null.");
            return;
        }

        try {
            User customer = order.getCustomer();
            String email = customer.getEmail();
            String name = customer.getFullName();
            String orderNumber = order.getOrderNumber() != null ? order.getOrderNumber() : "ORD-" + order.getId();

            EmailTemplateService.EmailContent content = emailTemplateService.buildRefundCompletedEmail(order, refundAmount, refundNotes);

            Notification notification = Notification.builder()
                    .user(customer)
                    .recipientEmail(email)
                    .recipientName(name)
                    .subject(content.getSubject())
                    .bodyHtml(content.getBodyHtml())
                    .bodyText(content.getBodyText())
                    .type(NotificationType.REFUND_COMPLETED)
                    .channel(NotificationChannel.EMAIL)
                    .referenceId(orderNumber)
                    .status(NotificationStatus.PENDING)
                    .isRead(false)
                    .build();

            Notification savedNotification = notificationRepository.save(notification);

            boolean isSent = emailService.sendHtmlEmail(email, name, content.getSubject(), content.getBodyHtml(), content.getBodyText());

            savedNotification.setStatus(isSent ? NotificationStatus.SENT : NotificationStatus.FAILED);
            if (isSent) {
                savedNotification.setSentAt(LocalDateTime.now());
            } else {
                savedNotification.setErrorMessage("Refund completed email dispatch failed.");
            }
            notificationRepository.save(savedNotification);

            logger.info("[NotificationService] Refund completed notification processed for Order #{} -> Recipient: {}", orderNumber, email);
        } catch (Exception e) {
            logger.error("[NotificationService] Error triggering Refund Completed notification: {}", e.getMessage(), e);
        }
    }

    // ==========================================
    // IN-APP NOTIFICATION QUERIES & MUTATIONS
    // ==========================================
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        if (notification.getUser() != null && !notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access Denied: Notification belongs to another user.");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadForUser(userId);
    }
}
