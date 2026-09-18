package com.infosys.auth.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "warehouse_id")
    private Long warehouseId;

    @Column(name = "reason", length = 1000, nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReturnStatus status = ReturnStatus.REQUESTED;

    @Column(name = "qc_remarks", length = 1000)
    private String qcRemarks;

    @Column(name = "qc_performed_by_staff_id")
    private Long qcPerformedByStaffId;

    @Column(name = "qc_performed_by_staff_name")
    private String qcPerformedByStaffName;

    @Column(name = "refund_amount")
    private BigDecimal refundAmount;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ReturnStatus {
        REQUESTED,
        APPROVED,
        REJECTED,
        INSPECTING_QC,
        QC_PASSED,
        QC_FAILED,
        REFUNDED
    }

    public ReturnRequest() {}

    public ReturnRequest(Long orderId, Long userId, String customerName, Long warehouseId, String reason, BigDecimal refundAmount) {
        this.orderId = orderId;
        this.userId = userId;
        this.customerName = customerName;
        this.warehouseId = warehouseId;
        this.reason = reason;
        this.refundAmount = refundAmount;
        this.status = ReturnStatus.REQUESTED;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public ReturnStatus getStatus() { return status; }
    public void setStatus(ReturnStatus status) { this.status = status; }

    public String getQcRemarks() { return qcRemarks; }
    public void setQcRemarks(String qcRemarks) { this.qcRemarks = qcRemarks; }

    public Long getQcPerformedByStaffId() { return qcPerformedByStaffId; }
    public void setQcPerformedByStaffId(Long qcPerformedByStaffId) { this.qcPerformedByStaffId = qcPerformedByStaffId; }

    public String getQcPerformedByStaffName() { return qcPerformedByStaffName; }
    public void setQcPerformedByStaffName(String qcPerformedByStaffName) { this.qcPerformedByStaffName = qcPerformedByStaffName; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
