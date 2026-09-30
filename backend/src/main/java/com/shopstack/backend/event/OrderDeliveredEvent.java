package com.shopstack.backend.event;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.User;

public class OrderDeliveredEvent {

    private final Order order;
    private final String deliveredAt;
    private final User user;

    public OrderDeliveredEvent(Order order, String deliveredAt, User user) {
        this.order = order;
        this.deliveredAt = deliveredAt;
        this.user = user;
    }

    public Order getOrder() {
        return order;
    }

    public String getDeliveredAt() {
        return deliveredAt;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "OrderDeliveredEvent{" +
                "orderId='" + (order != null ? order.getOrderId() : "null") + '\'' +
                ", deliveredAt='" + deliveredAt + '\'' +
                '}';
    }
}
