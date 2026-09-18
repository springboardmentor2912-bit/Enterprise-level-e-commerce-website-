package com.shopstack.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    WAREHOUSE_ALLOCATED,
    PROCESSING,
    READY_FOR_SHIPPING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURNED,
    REFUNDED
}
