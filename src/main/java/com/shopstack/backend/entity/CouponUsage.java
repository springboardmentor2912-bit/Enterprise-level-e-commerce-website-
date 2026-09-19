package com.shopstack.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usages")
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // Coupon that was used
    @ManyToOne
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;


    // Customer who used the coupon
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;


    // Order in which coupon was used
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;


    // Actual discount given
    @Column(nullable = false)
    private Double discountAmount;


    // When coupon was used
    @Column(nullable = false)
    private LocalDateTime usedAt;


    public CouponUsage() {
    }


    public Long getId() {
        return id;
    }


    public Coupon getCoupon() {
        return coupon;
    }

    public void setCoupon(Coupon coupon) {
        this.coupon = coupon;
    }


    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }


    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }


    public Double getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(
            Double discountAmount
    ) {
        this.discountAmount = discountAmount;
    }


    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(
            LocalDateTime usedAt
    ) {
        this.usedAt = usedAt;
    }
}