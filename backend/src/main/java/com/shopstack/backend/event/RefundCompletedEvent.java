package com.shopstack.backend.event;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.User;

public class RefundCompletedEvent {

    private final Refund refund;
    private final Order order;
    private final User user;

    public RefundCompletedEvent(Refund refund, Order order, User user) {
        this.refund = refund;
        this.order = order;
        this.user = user;
    }

    public Refund getRefund() {
        return refund;
    }

    public Order getOrder() {
        return order;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "RefundCompletedEvent{" +
                "refundId=" + (refund != null ? refund.getId() : "null") +
                ", orderId='" + (order != null ? order.getOrderId() : "null") + '\'' +
                ", amount=" + (refund != null ? refund.getAmount() : 0.0) +
                ", status='" + (refund != null ? refund.getStatus() : "null") + '\'' +
                '}';
    }
}
