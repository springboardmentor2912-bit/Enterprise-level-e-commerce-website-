package com.javaenterprise.order.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REJECTED,
    RETURN_REQUESTED, // 🆕 Customer wants a refund
    REFUNDED,
}