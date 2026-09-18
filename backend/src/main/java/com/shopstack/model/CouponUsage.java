package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usages")
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(nullable = false)
    private Double orderAmount;

    @Column(nullable = false)
    private Double discountAmount;

    @Column(nullable = false)
    private Double finalAmount;

    private LocalDateTime usedAt;

    public CouponUsage() {}

    public CouponUsage(Long id, Coupon coupon, User user, Order order, Double orderAmount, Double discountAmount, Double finalAmount, LocalDateTime usedAt) {
        this.id = id;
        this.coupon = coupon;
        this.user = user;
        this.order = order;
        this.orderAmount = orderAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.usedAt = usedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.usedAt == null) {
            this.usedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Coupon getCoupon() { return coupon; }
    public void setCoupon(Coupon coupon) { this.coupon = coupon; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    public static CouponUsageBuilder builder() {
        return new CouponUsageBuilder();
    }

    public static class CouponUsageBuilder {
        private Long id;
        private Coupon coupon;
        private User user;
        private Order order;
        private Double orderAmount;
        private Double discountAmount;
        private Double finalAmount;
        private LocalDateTime usedAt;

        public CouponUsageBuilder id(Long id) { this.id = id; return this; }
        public CouponUsageBuilder coupon(Coupon coupon) { this.coupon = coupon; return this; }
        public CouponUsageBuilder user(User user) { this.user = user; return this; }
        public CouponUsageBuilder order(Order order) { this.order = order; return this; }
        public CouponUsageBuilder orderAmount(Double orderAmount) { this.orderAmount = orderAmount; return this; }
        public CouponUsageBuilder discountAmount(Double discountAmount) { this.discountAmount = discountAmount; return this; }
        public CouponUsageBuilder finalAmount(Double finalAmount) { this.finalAmount = finalAmount; return this; }
        public CouponUsageBuilder usedAt(LocalDateTime usedAt) { this.usedAt = usedAt; return this; }

        public CouponUsage build() {
            return new CouponUsage(id, coupon, user, order, orderAmount, discountAmount, finalAmount, usedAt);
        }
    }
}
