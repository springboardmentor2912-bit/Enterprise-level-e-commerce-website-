package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "commissions")
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendorProfile;

    @Column(nullable = false)
    private Double orderAmount;

    @Column(nullable = false)
    private Double commissionRate;

    @Column(nullable = false)
    private Double commissionAmount;

    @Column(nullable = false)
    private Double vendorAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionStatus status = CommissionStatus.CALCULATED;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime settledAt;

    public Commission() {}

    public Commission(Long id, Order order, VendorProfile vendorProfile, Double orderAmount,
                      Double commissionRate, Double commissionAmount, Double vendorAmount,
                      CommissionStatus status, LocalDateTime createdAt, LocalDateTime settledAt) {
        this.id = id;
        this.order = order;
        this.vendorProfile = vendorProfile;
        this.orderAmount = orderAmount;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.vendorAmount = vendorAmount;
        this.status = status != null ? status : CommissionStatus.CALCULATED;
        this.createdAt = createdAt;
        this.settledAt = settledAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public VendorProfile getVendorProfile() { return vendorProfile; }
    public void setVendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Double getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Double commissionAmount) { this.commissionAmount = commissionAmount; }

    public Double getVendorAmount() { return vendorAmount; }
    public void setVendorAmount(Double vendorAmount) { this.vendorAmount = vendorAmount; }

    public CommissionStatus getStatus() { return status; }
    public void setStatus(CommissionStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }

    // Builder pattern
    public static CommissionBuilder builder() {
        return new CommissionBuilder();
    }

    public static class CommissionBuilder {
        private Long id;
        private Order order;
        private VendorProfile vendorProfile;
        private Double orderAmount;
        private Double commissionRate;
        private Double commissionAmount;
        private Double vendorAmount;
        private CommissionStatus status = CommissionStatus.CALCULATED;
        private LocalDateTime createdAt;
        private LocalDateTime settledAt;

        public CommissionBuilder id(Long id) { this.id = id; return this; }
        public CommissionBuilder order(Order order) { this.order = order; return this; }
        public CommissionBuilder vendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; return this; }
        public CommissionBuilder orderAmount(Double orderAmount) { this.orderAmount = orderAmount; return this; }
        public CommissionBuilder commissionRate(Double commissionRate) { this.commissionRate = commissionRate; return this; }
        public CommissionBuilder commissionAmount(Double commissionAmount) { this.commissionAmount = commissionAmount; return this; }
        public CommissionBuilder vendorAmount(Double vendorAmount) { this.vendorAmount = vendorAmount; return this; }
        public CommissionBuilder status(CommissionStatus status) { this.status = status; return this; }
        public CommissionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CommissionBuilder settledAt(LocalDateTime settledAt) { this.settledAt = settledAt; return this; }

        public Commission build() {
            return new Commission(id, order, vendorProfile, orderAmount, commissionRate, commissionAmount, vendorAmount, status, createdAt, settledAt);
        }
    }
}
