package com.shopstack.service;

import com.shopstack.entity.Customer;
import com.shopstack.entity.Order;
import com.shopstack.entity.Payment;
import com.shopstack.entity.ReturnRequest;
import com.shopstack.entity.Shipment;

import java.math.BigDecimal;

public interface NotificationService {

    /** 1. Triggered after successful order placement */
    void sendOrderPlacedEmail(Order order);

    /** 2. Triggered after payment verification succeeds */
    void sendPaymentSuccessEmail(Order order, Payment payment);

    /** 3. Triggered when payment fails or verification fails */
    void sendPaymentFailedEmail(Customer customer, String razorpayOrderId, BigDecimal amount, String failureReason);

    /** 4. Triggered when order status changes to SHIPPED */
    void sendOrderShippedEmail(Order order, Shipment shipment);

    /** 5. Triggered when order status changes to DELIVERED */
    void sendOrderDeliveredEmail(Order order, Shipment shipment);

    /** 6. Triggered when refund processing successfully completes */
    void sendRefundCompletedEmail(Order order, ReturnRequest returnRequest);
}
