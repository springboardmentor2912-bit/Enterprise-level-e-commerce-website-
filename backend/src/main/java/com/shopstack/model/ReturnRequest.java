package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse; // Target assigned return warehouse

    @Column(nullable = false)
    private String reason;

    private String returnReasonType; // DEFECTIVE, DAMAGED_IN_TRANSIT, WRONG_ITEM, CHANGED_MIND

    @Column(columnDefinition = "TEXT")
    private String customerComments;

    @Column(nullable = false)
    private String status = "PENDING_REVIEW"; // PENDING_REVIEW, APPROVED, REJECTED, RECEIVED_AT_WAREHOUSE, QC_PASSED_RESTOCKED, QC_FAILED_DAMAGED, REFUND_COMPLETED

    private Double refundAmount;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    @Column(columnDefinition = "TEXT")
    private String qcNotes;

    private String qcDecision; // PASS, FAIL

    private String inspectedBy;

    private LocalDateTime inspectedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ReturnRequest() {}

    public ReturnRequest(Long id, Order order, OrderItem orderItem, User customer, Warehouse warehouse,
                         String reason, String returnReasonType, String customerComments, String status,
                         Double refundAmount, String adminNotes, String qcNotes, String qcDecision,
                         String inspectedBy, LocalDateTime inspectedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.order = order;
        this.orderItem = orderItem;
        this.customer = customer;
        this.warehouse = warehouse;
        this.reason = reason;
        this.returnReasonType = returnReasonType;
        this.customerComments = customerComments;
        this.status = status != null ? status : "PENDING_REVIEW";
        this.refundAmount = refundAmount;
        this.adminNotes = adminNotes;
        this.qcNotes = qcNotes;
        this.qcDecision = qcDecision;
        this.inspectedBy = inspectedBy;
        this.inspectedAt = inspectedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING_REVIEW";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

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

    public static ReturnRequestBuilder builder() {
        return new ReturnRequestBuilder();
    }

    public static class ReturnRequestBuilder {
        private Long id;
        private Order order;
        private OrderItem orderItem;
        private User customer;
        private Warehouse warehouse;
        private String reason;
        private String returnReasonType;
        private String customerComments;
        private String status = "PENDING_REVIEW";
        private Double refundAmount;
        private String adminNotes;
        private String qcNotes;
        private String qcDecision;
        private String inspectedBy;
        private LocalDateTime inspectedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ReturnRequestBuilder id(Long id) { this.id = id; return this; }
        public ReturnRequestBuilder order(Order order) { this.order = order; return this; }
        public ReturnRequestBuilder orderItem(OrderItem orderItem) { this.orderItem = orderItem; return this; }
        public ReturnRequestBuilder customer(User customer) { this.customer = customer; return this; }
        public ReturnRequestBuilder warehouse(Warehouse warehouse) { this.warehouse = warehouse; return this; }
        public ReturnRequestBuilder reason(String reason) { this.reason = reason; return this; }
        public ReturnRequestBuilder returnReasonType(String returnReasonType) { this.returnReasonType = returnReasonType; return this; }
        public ReturnRequestBuilder customerComments(String customerComments) { this.customerComments = customerComments; return this; }
        public ReturnRequestBuilder status(String status) { this.status = status; return this; }
        public ReturnRequestBuilder refundAmount(Double refundAmount) { this.refundAmount = refundAmount; return this; }
        public ReturnRequestBuilder adminNotes(String adminNotes) { this.adminNotes = adminNotes; return this; }
        public ReturnRequestBuilder qcNotes(String qcNotes) { this.qcNotes = qcNotes; return this; }
        public ReturnRequestBuilder qcDecision(String qcDecision) { this.qcDecision = qcDecision; return this; }
        public ReturnRequestBuilder inspectedBy(String inspectedBy) { this.inspectedBy = inspectedBy; return this; }
        public ReturnRequestBuilder inspectedAt(LocalDateTime inspectedAt) { this.inspectedAt = inspectedAt; return this; }
        public ReturnRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ReturnRequestBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ReturnRequest build() {
            return new ReturnRequest(id, order, orderItem, customer, warehouse, reason, returnReasonType, customerComments,
                    status, refundAmount, adminNotes, qcNotes, qcDecision, inspectedBy, inspectedAt, createdAt, updatedAt);
        }
    }
}
