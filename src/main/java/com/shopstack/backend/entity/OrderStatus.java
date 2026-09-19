package com.shopstack.backend.entity;

public enum OrderStatus {
    PLACED,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED,
    RETURNED,
    REFUNDED
}
