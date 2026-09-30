package com.shopstack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "settlements")
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long vendorId;

    @Column(nullable = false)
    private String orderId;

    private Long orderItemId;

    @Column(length = 1000)
    private String productName;

    private double grossAmount;
    private double commissionPercentage;
    private double commissionAmount;
    private double netPayoutAmount;

    private String status; // PENDING, SETTLED, ON_HOLD
    private String createdAt;
    private String settledAt;

    public Settlement() {}

    public Settlement(Long vendorId, String orderId, Long orderItemId, String productName,
                      double grossAmount, double commissionPercentage, double commissionAmount,
                      double netPayoutAmount, String status, String createdAt, String settledAt) {
        this.vendorId = vendorId;
        this.orderId = orderId;
        this.orderItemId = orderItemId;
        this.productName = productName;
        this.grossAmount = grossAmount;
        this.commissionPercentage = commissionPercentage;
        this.commissionAmount = commissionAmount;
        this.netPayoutAmount = netPayoutAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.settledAt = settledAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getGrossAmount() { return grossAmount; }
    public void setGrossAmount(double grossAmount) { this.grossAmount = grossAmount; }

    public double getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(double commissionPercentage) { this.commissionPercentage = commissionPercentage; }

    public double getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(double commissionAmount) { this.commissionAmount = commissionAmount; }

    public double getNetPayoutAmount() { return netPayoutAmount; }
    public void setNetPayoutAmount(double netPayoutAmount) { this.netPayoutAmount = netPayoutAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getSettledAt() { return settledAt; }
    public void setSettledAt(String settledAt) { this.settledAt = settledAt; }
}
