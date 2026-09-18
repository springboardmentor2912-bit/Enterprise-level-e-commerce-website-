package com.shopstack.backend.event;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.User;

public class OrderShippedEvent {

    private final Order order;
    private final String trackingNumber;
    private final String carrierOrWarehouse;
    private final String shippedAt;
    private final User user;

    public OrderShippedEvent(Order order, String trackingNumber, String carrierOrWarehouse, String shippedAt, User user) {
        this.order = order;
        this.trackingNumber = trackingNumber;
        this.carrierOrWarehouse = carrierOrWarehouse;
        this.shippedAt = shippedAt;
        this.user = user;
    }

    public Order getOrder() {
        return order;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public String getCarrierOrWarehouse() {
        return carrierOrWarehouse;
    }

    public String getShippedAt() {
        return shippedAt;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "OrderShippedEvent{" +
                "orderId='" + (order != null ? order.getOrderId() : "null") + '\'' +
                ", trackingNumber='" + trackingNumber + '\'' +
                ", carrierOrWarehouse='" + carrierOrWarehouse + '\'' +
                '}';
    }
}
