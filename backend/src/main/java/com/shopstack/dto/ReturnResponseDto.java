package com.shopstack.dto;

import java.time.LocalDateTime;

public class ReturnResponseDto {

    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long orderItemId;
    private Long productId;
    private String productTitle;
    private String productImageUrl;
    private Integer quantity;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private String reason;
    private String returnReasonType;
    private String customerComments;
    private String status;
    private Double refundAmount;
    private String adminNotes;
    private String qcNotes;
    private String qcDecision;
    private String inspectedBy;
    private LocalDateTime inspectedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReturnResponseDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReturnReasonType() { return returnReasonType; }
    public void setReturnReasonType(String returnReasonType) { this.returnReasonType = returnReasonType; }

    public String getCustomerComments() { return customerComments; }
    public void setCustomerComments(String customerComments) { this.customerComments = customerComments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getQcNotes() { return qcNotes; }
    public void setQcNotes(String qcNotes) { this.qcNotes = qcNotes; }

    public String getQcDecision() { return qcDecision; }
    public void setQcDecision(String qcDecision) { this.qcDecision = qcDecision; }

    public String getInspectedBy() { return inspectedBy; }
    public void setInspectedBy(String inspectedBy) { this.inspectedBy = inspectedBy; }

    public LocalDateTime getInspectedAt() { return inspectedAt; }
    public void setInspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
