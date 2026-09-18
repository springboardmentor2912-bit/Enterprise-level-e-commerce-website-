package com.shopstack.service;

import com.shopstack.model.*;
import com.shopstack.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @InjectMocks
    private NotificationService notificationService;

    private User testUser;
    private Order testOrder;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .fullName("Sarah Jenkins")
                .email("sarah.jenkins@example.com")
                .role(Role.CUSTOMER)
                .build();

        testOrder = Order.builder()
                .id(1001L)
                .orderNumber("ORD-1001A")
                .customer(testUser)
                .totalAmount(2499.0)
                .status(OrderStatus.CONFIRMED)
                .build();

        testPayment = Payment.builder()
                .id(501L)
                .razorpayOrderId("order_rzp_112233")
                .razorpayPaymentId("pay_rzp_445566")
                .amount(2499.0)
                .status(PaymentStatus.PAID)
                .customer(testUser)
                .build();
    }

    @Test
    @DisplayName("1. Trigger Order Placed Notification")
    void testSendOrderPlacedNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Order Confirmation: #ORD-1001A",
                "<h1>Order Confirmed</h1>",
                "Order Confirmed"
        );
        when(emailTemplateService.buildOrderPlacedEmail(any(Order.class))).thenReturn(content);

        Notification notif = Notification.builder()
                .id(10L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.ORDER_PLACED)
                .referenceId("ORD-1001A")
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendOrderPlacedNotification(testOrder);

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("2. Trigger Payment Success Notification")
    void testSendPaymentSuccessNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Payment Confirmation: pay_rzp_445566 [SUCCESS]",
                "<h1>Payment Success</h1>",
                "Payment Success"
        );
        when(emailTemplateService.buildPaymentSuccessEmail(any(Payment.class), anyList())).thenReturn(content);

        Notification notif = Notification.builder()
                .id(11L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.PAYMENT_SUCCESS)
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendPaymentSuccessNotification(testPayment, List.of(testOrder));

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("3. Trigger Payment Failed Notification")
    void testSendPaymentFailedNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Payment Failed",
                "<h1>Payment Failed</h1>",
                "Payment Failed"
        );
        when(emailTemplateService.buildPaymentFailedEmail(any(Payment.class), anyString())).thenReturn(content);

        Notification notif = Notification.builder()
                .id(12L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.PAYMENT_FAILED)
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendPaymentFailedNotification(testPayment, "Card expired");

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("4. Trigger Order Shipped Notification")
    void testSendOrderShippedNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Your Order Has Been Shipped!",
                "<h1>Order Shipped</h1>",
                "Order Shipped"
        );
        when(emailTemplateService.buildOrderShippedEmail(any(Order.class), anyString(), anyString())).thenReturn(content);

        Notification notif = Notification.builder()
                .id(13L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.ORDER_SHIPPED)
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendOrderShippedNotification(testOrder, "BlueDart Express", "TRK-BLD-123456");

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("5. Trigger Order Delivered Notification")
    void testSendOrderDeliveredNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Delivered: Order Delivered Successfully",
                "<h1>Order Delivered</h1>",
                "Order Delivered"
        );
        when(emailTemplateService.buildOrderDeliveredEmail(any(Order.class))).thenReturn(content);

        Notification notif = Notification.builder()
                .id(14L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.ORDER_DELIVERED)
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendOrderDeliveredNotification(testOrder);

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("6. Trigger Refund Completed Notification")
    void testSendRefundCompletedNotification() {
        EmailTemplateService.EmailContent content = new EmailTemplateService.EmailContent(
                "Refund Processed",
                "<h1>Refund Processed</h1>",
                "Refund Processed"
        );
        when(emailTemplateService.buildRefundCompletedEmail(any(Order.class), anyDouble(), anyString())).thenReturn(content);

        Notification notif = Notification.builder()
                .id(15L)
                .user(testUser)
                .recipientEmail(testUser.getEmail())
                .type(NotificationType.REFUND_COMPLETED)
                .status(NotificationStatus.PENDING)
                .build();
        when(notificationRepository.save(any(Notification.class))).thenReturn(notif);
        when(emailService.sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString())).thenReturn(true);

        notificationService.sendRefundCompletedNotification(testOrder, 2499.0, "QC Approved and restocked");

        verify(notificationRepository, atLeastOnce()).save(any(Notification.class));
        verify(emailService, times(1)).sendHtmlEmail(eq("sarah.jenkins@example.com"), eq("Sarah Jenkins"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("7. In-App Notification Queries & Mark as Read")
    void testInAppNotifications() {
        Notification n1 = Notification.builder().id(101L).user(testUser).isRead(false).build();
        Notification n2 = Notification.builder().id(102L).user(testUser).isRead(true).build();

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(n1, n2));
        when(notificationRepository.countByUserIdAndIsReadFalse(1L)).thenReturn(1L);
        when(notificationRepository.findById(101L)).thenReturn(Optional.of(n1));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        List<Notification> list = notificationService.getUserNotifications(1L);
        assertEquals(2, list.size());

        long unread = notificationService.getUnreadCount(1L);
        assertEquals(1L, unread);

        Notification marked = notificationService.markAsRead(101L, 1L);
        assertTrue(marked.getIsRead());

        notificationService.markAllAsRead(1L);
        verify(notificationRepository, times(1)).markAllAsReadForUser(1L);
    }
}
