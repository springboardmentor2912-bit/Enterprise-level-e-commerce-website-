package com.shopstack.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "commissions")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Order associated with this commission
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Vendor who owns the products
    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private User vendor;

    // Amount of the sale belonging to this vendor
    @Column(nullable = false)
    private Double saleAmount;

    // Commission percentage
    @Column(nullable = false)
    private Double commissionRate;

    // Amount kept by ShopStack
    @Column(nullable = false)
    private Double commissionAmount;

    // Amount payable to vendor
    @Column(nullable = false)
    private Double vendorAmount;

    // Commission status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionStatus status;

    // Current commission creation timestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Legacy/database commission date column
    @Column(name = "commission_date", nullable = false)
    private LocalDateTime commissionDate;

    public Commission() {
    }

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public User getVendor() {
        return vendor;
    }

    public void setVendor(User vendor) {
        this.vendor = vendor;
    }

    public Double getSaleAmount() {
        return saleAmount;
    }

    public void setSaleAmount(Double saleAmount) {
        this.saleAmount = saleAmount;
    }

    public Double getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(Double commissionRate) {
        this.commissionRate = commissionRate;
    }

    public Double getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(Double commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public Double getVendorAmount() {
        return vendorAmount;
    }

    public void setVendorAmount(Double vendorAmount) {
        this.vendorAmount = vendorAmount;
    }

    public CommissionStatus getStatus() {
        return status;
    }

    public void setStatus(CommissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCommissionDate() {
        return commissionDate;
    }

    public void setCommissionDate(LocalDateTime commissionDate) {
        this.commissionDate = commissionDate;
    }
}