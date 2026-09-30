package com.shopstack.backend.event;

import java.util.List;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.User;

public class OrderPlacedEvent {

    private final Order order;
    private final List<OrderItem> items;
    private final User user;

    public OrderPlacedEvent(Order order, List<OrderItem> items, User user) {
        this.order = order;
        this.items = items;
        this.user = user;
    }

    public Order getOrder() {
        return order;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "OrderPlacedEvent{" +
                "orderId='" + (order != null ? order.getOrderId() : "null") + '\'' +
                ", userId=" + (user != null ? user.getId() : "null") +
                ", totalAmount=" + (order != null ? order.getTotalAmount() : 0.0) +
                '}';
    }
}
