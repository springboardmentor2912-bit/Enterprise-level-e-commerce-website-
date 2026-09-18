package com.javaenterprise.returnRequest.entity; // Adjust package as needed

public enum ReturnStatus {
    REQUESTED,      // Customer just asked for it
    APPROVED,       // Admin approved the request
    REJECTED,       // Admin rejected it
    RECEIVED,       // Warehouse/Admin physically got the item back
    REFUNDED        // Money sent back to customer
}