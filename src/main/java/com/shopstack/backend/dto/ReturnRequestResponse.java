package com.shopstack.backend.dto;

import java.time.LocalDateTime;

public class ReturnRequestResponse {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String imageUrl;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Integer quantity;
    private String reason;
    private String status;
    private String condition;
    private String adminComment;
    private String inspectionComment;
    private Double refundAmount;
    private String refundId;
    private Boolean inventoryRestocked;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime returnedAt;
    private LocalDateTime receivedAt;
    private LocalDateTime inspectedAt;
    private LocalDateTime refundInitiatedAt;
    private LocalDateTime refundedAt;
    private String orderStatus;
    private String paymentStatus;

    public ReturnRequestResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
    public String getInspectionComment() { return inspectionComment; }
    public void setInspectionComment(String inspectionComment) { this.inspectionComment = inspectionComment; }
    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }
    public String getRefundId() { return refundId; }
    public void setRefundId(String refundId) { this.refundId = refundId; }
    public Boolean getInventoryRestocked() { return inventoryRestocked; }
    public void setInventoryRestocked(Boolean inventoryRestocked) { this.inventoryRestocked = inventoryRestocked; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }
    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }
    public LocalDateTime getInspectedAt() { return inspectedAt; }
    public void setInspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; }
    public LocalDateTime getRefundInitiatedAt() { return refundInitiatedAt; }
    public void setRefundInitiatedAt(LocalDateTime refundInitiatedAt) { this.refundInitiatedAt = refundInitiatedAt; }
    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
