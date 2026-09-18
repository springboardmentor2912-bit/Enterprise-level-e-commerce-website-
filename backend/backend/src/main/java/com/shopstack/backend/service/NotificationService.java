package com.shopstack.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.backend.entity.Notification;
import com.shopstack.backend.entity.NotificationType;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    /**
     * Creates a notification for a customer and sends
     * the corresponding email notification.
     *
     * The customer's registered email is used as the
     * recipient. The customer's display name is handled
     * by EmailService.
     */
    @Transactional
    public Notification createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            String orderId,
            String paymentId,
            Double amount) {

        if (user == null) {
            throw new IllegalArgumentException(
                    "Cannot create notification without a user."
            );
        }

        if (type == null) {
            throw new IllegalArgumentException(
                    "Notification type cannot be null."
            );
        }

        Notification notification = new Notification(
                user,
                type,
                title,
                message
        );

        notification.setOrderId(orderId);
        notification.setPaymentId(paymentId);
        notification.setAmount(amount);

        // Save notification in the database.
        Notification savedNotification =
                notificationRepository.save(notification);

        // Send email to the customer's registered email.
        // Email failure does not prevent the database
        // notification from being created.
        emailService.sendNotificationEmail(
                user,
                savedNotification
        );

        return savedNotification;
    }
}