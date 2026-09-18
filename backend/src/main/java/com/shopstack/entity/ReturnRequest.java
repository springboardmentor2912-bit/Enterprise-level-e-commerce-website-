package com.shopstack.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_status", nullable = false)
    private ReturnStatus returnStatus = ReturnStatus.RETURN_REQUESTED;

    @Column(name = "admin_notes", length = 2000)
    private String adminNotes;

    /** True if admin marks the returned product as usable for restock */
    @Column(name = "is_usable")
    private Boolean isUsable;

    /** The warehouse into which usable stock was restocked */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "restock_warehouse_id")
    private Warehouse restockWarehouse;

    /** The refund amount (item price × quantity returned) */
    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    /** Razorpay refund ID returned after a successful refund API call */
    @Column(name = "razorpay_refund_id")
    private String razorpayRefundId;

    /** Razorpay refund failure reason if refund fails */
    @Column(name = "refund_failure_reason", length = 1000)
    private String refundFailureReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "qc_result")
    private QCResult qcResult;

    @Enumerated(EnumType.STRING)
    @Column(name = "damage_type")
    private DamageType damageType;

    @Column(name = "damage_description", length = 2000)
    private String damageDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "damage_responsibility")
    private DamageResponsibility damageResponsibility;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "qc_staff_id")
    private Customer qcStaff;

    @Column(name = "qc_date")
    private LocalDateTime qcDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ReturnRequest() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ─── Getters & Setters ────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public ReturnStatus getReturnStatus() { return returnStatus; }
    public void setReturnStatus(ReturnStatus returnStatus) { this.returnStatus = returnStatus; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Boolean getIsUsable() { return isUsable; }
    public void setIsUsable(Boolean isUsable) { this.isUsable = isUsable; }

    public Warehouse getRestockWarehouse() { return restockWarehouse; }
    public void setRestockWarehouse(Warehouse restockWarehouse) { this.restockWarehouse = restockWarehouse; }

    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }

    public String getRazorpayRefundId() { return razorpayRefundId; }
    public void setRazorpayRefundId(String razorpayRefundId) { this.razorpayRefundId = razorpayRefundId; }

    public String getRefundFailureReason() { return refundFailureReason; }
    public void setRefundFailureReason(String refundFailureReason) { this.refundFailureReason = refundFailureReason; }

    public QCResult getQcResult() { return qcResult; }
    public void setQcResult(QCResult qcResult) { this.qcResult = qcResult; }

    public DamageType getDamageType() { return damageType; }
    public void setDamageType(DamageType damageType) { this.damageType = damageType; }

    public String getDamageDescription() { return damageDescription; }
    public void setDamageDescription(String damageDescription) { this.damageDescription = damageDescription; }

    public DamageResponsibility getDamageResponsibility() { return damageResponsibility; }
    public void setDamageResponsibility(DamageResponsibility damageResponsibility) { this.damageResponsibility = damageResponsibility; }

    public Customer getQcStaff() { return qcStaff; }
    public void setQcStaff(Customer qcStaff) { this.qcStaff = qcStaff; }

    public LocalDateTime getQcDate() { return qcDate; }
    public void setQcDate(LocalDateTime qcDate) { this.qcDate = qcDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
