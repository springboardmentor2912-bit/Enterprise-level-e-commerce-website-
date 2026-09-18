package com.shopstack.backend.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.shopstack.backend.event.OrderDeliveredEvent;
import com.shopstack.backend.event.OrderPlacedEvent;
import com.shopstack.backend.event.OrderShippedEvent;
import com.shopstack.backend.event.PaymentFailedEvent;
import com.shopstack.backend.event.PaymentSuccessEvent;
import com.shopstack.backend.event.RefundCompletedEvent;
import com.shopstack.backend.service.NotificationService;

@Component
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    @Autowired
    private NotificationService notificationService;

    @Async("emailTaskExecutor")
    @EventListener
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        log.info("[NotificationEventListener] Received OrderPlacedEvent for order: {}", 
                event.getOrder() != null ? event.getOrder().getOrderId() : "N/A");
        notificationService.sendOrderPlacedNotification(event.getOrder(), event.getItems(), event.getUser());
    }

    @Async("emailTaskExecutor")
    @EventListener
    public void handlePaymentSuccessEvent(PaymentSuccessEvent event) {
        log.info("[NotificationEventListener] Received PaymentSuccessEvent for order: {}, paymentId: {}", 
                event.getOrder() != null ? event.getOrder().getOrderId() : "N/A", event.getPaymentId());
        notificationService.sendPaymentSuccessNotification(event.getOrder(), event.getPaymentId(), event.getAmount(), event.getPaymentMethod(), event.getUser());
    }

    @Async("emailTaskExecutor")
    @EventListener
    public void handlePaymentFailedEvent(PaymentFailedEvent event) {
        log.info("[NotificationEventListener] Received PaymentFailedEvent for user: {}, orderId: {}", 
                event.getUserId(), event.getOrderId());
        notificationService.sendPaymentFailedNotification(
                event.getUserId(), 
                event.getCustomerEmail(), 
                event.getCustomerName(), 
                event.getOrderId(), 
                event.getRazorpayOrderId(), 
                event.getAmount(), 
                event.getFailureReason(), 
                event.getUser()
        );
    }

    @Async("emailTaskExecutor")
    @EventListener
    public void handleOrderShippedEvent(OrderShippedEvent event) {
        log.info("[NotificationEventListener] Received OrderShippedEvent for order: {}, tracking: {}", 
                event.getOrder() != null ? event.getOrder().getOrderId() : "N/A", event.getTrackingNumber());
        notificationService.sendOrderShippedNotification(
                event.getOrder(), 
                event.getTrackingNumber(), 
                event.getCarrierOrWarehouse(), 
                event.getShippedAt(), 
                event.getUser()
        );
    }

    @Async("emailTaskExecutor")
    @EventListener
    public void handleOrderDeliveredEvent(OrderDeliveredEvent event) {
        log.info("[NotificationEventListener] Received OrderDeliveredEvent for order: {}", 
                event.getOrder() != null ? event.getOrder().getOrderId() : "N/A");
        notificationService.sendOrderDeliveredNotification(event.getOrder(), event.getDeliveredAt(), event.getUser());
    }

    @Async("emailTaskExecutor")
    @EventListener
    public void handleRefundCompletedEvent(RefundCompletedEvent event) {
        log.info("[NotificationEventListener] Received RefundCompletedEvent for order: {}, refundId: {}", 
                event.getOrder() != null ? event.getOrder().getOrderId() : "N/A", 
                event.getRefund() != null ? event.getRefund().getId() : "N/A");
        notificationService.sendRefundCompletedNotification(event.getRefund(), event.getOrder(), event.getUser());
    }
}
