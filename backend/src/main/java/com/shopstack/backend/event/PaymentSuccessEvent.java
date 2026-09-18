package com.shopstack.backend.event;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.User;

public class PaymentSuccessEvent {

    private final Order order;
    private final String paymentId;
    private final double amount;
    private final String paymentMethod;
    private final User user;

    public PaymentSuccessEvent(Order order, String paymentId, double amount, String paymentMethod, User user) {
        this.order = order;
        this.paymentId = paymentId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.user = user;
    }

    public Order getOrder() {
        return order;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public double getAmount() {
        return amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "PaymentSuccessEvent{" +
                "orderId='" + (order != null ? order.getOrderId() : "null") + '\'' +
                ", paymentId='" + paymentId + '\'' +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}
