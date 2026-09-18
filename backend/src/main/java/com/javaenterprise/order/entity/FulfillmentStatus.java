package com.javaenterprise.order.entity;

public enum FulfillmentStatus {
    PENDING,
    ALLOCATED,           // Stock reserved in a specific warehouse
    PICKED,              // Item picked from the shelf
    PACKED,              // Item packed in a box
    READY_FOR_SHIPMENT   // Handed over to courier
}