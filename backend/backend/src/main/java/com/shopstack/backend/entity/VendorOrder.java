package com.shopstack.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "vendor_orders")
public class VendorOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vendor_id", nullable = false)
    @JsonIgnore
    private User vendor;

    private Long productId;
    private String orderReference;
    private String productName;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String paymentMethod;
    private String deliveryMethod;
    private int quantity;
    private double unitPrice;
    private double totalAmount;
    @jakarta.persistence.Column(columnDefinition = "double precision default 0")
    private double commissionPercentage;
    @jakarta.persistence.Column(columnDefinition = "double precision default 0")
    private double commissionAmount;
    @jakarta.persistence.Column(columnDefinition = "double precision default 0")
    private double customerTotalAmount;
    private LocalDateTime placedAt = LocalDateTime.now();
    private String status = "NEW";
    private String orderStatus = "PROCESSING";
    // Warehouse fulfillment is tracked independently from carrier delivery.
    private String warehouseStatus = "ORDER_CONFIRMED";
    private String warehouseName;
    private int warehouseAllocatedQuantity = 0;
    private LocalDateTime warehouseUpdatedAt;
    private String refundStatus = "NONE";
    private String refundReason;
    private String refundDetails;
    private String previousOrderStatus;
    private LocalDateTime refundRequestedAt;
    private LocalDateTime refundProcessedAt;
    @jakarta.persistence.Column(name = "customer_notification_read", nullable = false)
    private boolean customerNotificationRead = false;

    public Long getId() { return id; }
    public User getVendor() { return vendor; }
    public void setVendor(User vendor) { this.vendor = vendor; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getOrderReference() { return orderReference; }
    public void setOrderReference(String orderReference) { this.orderReference = orderReference; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getDeliveryMethod() { return deliveryMethod; }
    public void setDeliveryMethod(String deliveryMethod) { this.deliveryMethod = deliveryMethod; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public double getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(double commissionPercentage) { this.commissionPercentage = commissionPercentage; }
    public double getCommissionAmount() { return "REFUNDED".equals(orderStatus) || "REFUNDED".equals(refundStatus) ? 0 : commissionAmount; }
    public void setCommissionAmount(double commissionAmount) { this.commissionAmount = commissionAmount; }
    public double getCustomerTotalAmount() { return customerTotalAmount; }
    public void setCustomerTotalAmount(double customerTotalAmount) { this.customerTotalAmount = customerTotalAmount; }
    public double getVendorNetAmount() {
        if ("REFUNDED".equals(orderStatus) || "REFUNDED".equals(refundStatus)) return 0;
        // Older orders may not have a coupon-adjusted amount stored.
        double productTotal = customerTotalAmount > 0 || totalAmount == 0 ? customerTotalAmount : totalAmount;
        return Math.max(0, productTotal - commissionAmount);
    }
    public LocalDateTime getPlacedAt() { return placedAt; }
    public void setPlacedAt(LocalDateTime placedAt) { this.placedAt = placedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getWarehouseStatus() {
        // Keep older records consistent after delivery was completed before
        // warehouseStatus was synchronized with the final delivery status.
        return "DELIVERED".equals(orderStatus) ? "DELIVERED" : warehouseStatus;
    }
    public void setWarehouseStatus(String warehouseStatus) { this.warehouseStatus = warehouseStatus; }
    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
    public int getWarehouseAllocatedQuantity() { return warehouseAllocatedQuantity; }
    public void setWarehouseAllocatedQuantity(int warehouseAllocatedQuantity) { this.warehouseAllocatedQuantity = warehouseAllocatedQuantity; }
    public LocalDateTime getWarehouseUpdatedAt() { return warehouseUpdatedAt; }
    public void setWarehouseUpdatedAt(LocalDateTime warehouseUpdatedAt) { this.warehouseUpdatedAt = warehouseUpdatedAt; }
    public String getRefundStatus() { return refundStatus; }
    public void setRefundStatus(String refundStatus) { this.refundStatus = refundStatus; }
    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String refundReason) { this.refundReason = refundReason; }
    public String getRefundDetails() { return refundDetails; }
    public void setRefundDetails(String refundDetails) { this.refundDetails = refundDetails; }
    public String getPreviousOrderStatus() { return previousOrderStatus; }
    public void setPreviousOrderStatus(String previousOrderStatus) { this.previousOrderStatus = previousOrderStatus; }
    public LocalDateTime getRefundRequestedAt() { return refundRequestedAt; }
    public void setRefundRequestedAt(LocalDateTime refundRequestedAt) { this.refundRequestedAt = refundRequestedAt; }
    public LocalDateTime getRefundProcessedAt() { return refundProcessedAt; }
    public void setRefundProcessedAt(LocalDateTime refundProcessedAt) { this.refundProcessedAt = refundProcessedAt; }
    public boolean isCustomerNotificationRead() { return customerNotificationRead; }
    public void setCustomerNotificationRead(boolean customerNotificationRead) { this.customerNotificationRead = customerNotificationRead; }
}
