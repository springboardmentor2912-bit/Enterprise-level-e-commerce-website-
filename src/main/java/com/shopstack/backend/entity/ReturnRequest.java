package com.shopstack.backend.entity;

import com.shopstack.backend.enums.ReturnCondition;
import com.shopstack.backend.enums.ReturnStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "return_requests",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_return_order_product",
                columnNames = {"order_id", "product_id"}
        )
)
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnStatus status = ReturnStatus.REQUESTED;

    @Enumerated(EnumType.STRING)
    private ReturnCondition condition;

    @Column(length = 1000)
    private String adminComment;

    @Column(length = 1000)
    private String inspectionComment;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime returnedAt;
    private LocalDateTime receivedAt;
    private LocalDateTime inspectedAt;
    private LocalDateTime refundInitiatedAt;
    private LocalDateTime refundedAt;

    private Double refundAmount;
    private String refundId;
    private Boolean inventoryRestocked = false;

    public ReturnRequest() {
    }

    public Long getId() { return id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public ReturnStatus getStatus() { return status; }
    public void setStatus(ReturnStatus status) { this.status = status; }
    public ReturnCondition getCondition() { return condition; }
    public void setCondition(ReturnCondition condition) { this.condition = condition; }
    public String getAdminComment() { return adminComment; }
    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }
    public String getInspectionComment() { return inspectionComment; }
    public void setInspectionComment(String inspectionComment) { this.inspectionComment = inspectionComment; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }
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
    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }
    public String getRefundId() { return refundId; }
    public void setRefundId(String refundId) { this.refundId = refundId; }
    public Boolean getInventoryRestocked() { return inventoryRestocked; }
    public void setInventoryRestocked(Boolean inventoryRestocked) { this.inventoryRestocked = inventoryRestocked; }
}
