package com.shopstack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "refunds")
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String orderId;

    private String razorpayPaymentId;
    private String razorpayRefundId;
    private double amount;

    private String returnReasonCategory; // DEFECTIVE_DAMAGED, WRONG_ITEM, SIZE_FIT_ISSUE, CHANGED_MIND, NOT_AS_DESCRIBED
    private String resolutionType; // REFUND, REPLACEMENT, EXCHANGE

    @Column(length = 1000)
    private String reason;

    @Column(length = 1000)
    private String customerNotes;

    @Column(length = 1000)
    private String adminNotes;

    @Column(length = 2000)
    private String customerProofImage;

    @Column(length = 2000)
    private String warehouseInspectionImage;

    private String returnStage; // REQUESTED, ITEM_RETURNED, QC_PASSED, QC_FAILED, REFUNDED, REJECTED
    private String status; // PENDING, PROCESSED, REJECTED, FAILED
    private String requestedAt;
    private String processedAt;

    public Refund() {}

    public Refund(String orderId, String razorpayPaymentId, String razorpayRefundId, double amount, String reason, String status, String requestedAt, String processedAt) {
        this.orderId = orderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpayRefundId = razorpayRefundId;
        this.amount = amount;
        this.reason = reason;
        this.status = status;
        this.returnStage = "PROCESSED".equalsIgnoreCase(status) ? "REFUNDED" : "REQUESTED";
        this.resolutionType = "REFUND";
        this.requestedAt = requestedAt;
        this.processedAt = processedAt;
    }

    public Refund(String orderId, String razorpayPaymentId, double amount, String returnReasonCategory, 
                  String resolutionType, String reason, String customerNotes, String status, 
                  String returnStage, String requestedAt) {
        this.orderId = orderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.amount = amount;
        this.returnReasonCategory = returnReasonCategory;
        this.resolutionType = resolutionType != null ? resolutionType : "REFUND";
        this.reason = reason;
        this.customerNotes = customerNotes;
        this.status = status != null ? status : "PENDING";
        this.returnStage = returnStage != null ? returnStage : "REQUESTED";
        this.requestedAt = requestedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpayRefundId() { return razorpayRefundId; }
    public void setRazorpayRefundId(String razorpayRefundId) { this.razorpayRefundId = razorpayRefundId; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getReturnReasonCategory() { return returnReasonCategory; }
    public void setReturnReasonCategory(String returnReasonCategory) { this.returnReasonCategory = returnReasonCategory; }

    public String getResolutionType() { return resolutionType; }
    public void setResolutionType(String resolutionType) { this.resolutionType = resolutionType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getCustomerNotes() { return customerNotes; }
    public void setCustomerNotes(String customerNotes) { this.customerNotes = customerNotes; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getReturnStage() { return returnStage; }
    public void setReturnStage(String returnStage) { this.returnStage = returnStage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedAt() { return requestedAt; }
    public void setRequestedAt(String requestedAt) { this.requestedAt = requestedAt; }

    public String getProcessedAt() { return processedAt; }
    public void setProcessedAt(String processedAt) { this.processedAt = processedAt; }

    public String getCustomerProofImage() { return customerProofImage; }
    public void setCustomerProofImage(String customerProofImage) { this.customerProofImage = customerProofImage; }

    public String getWarehouseInspectionImage() { return warehouseInspectionImage; }
    public void setWarehouseInspectionImage(String warehouseInspectionImage) { this.warehouseInspectionImage = warehouseInspectionImage; }
}
