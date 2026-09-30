package com.shopstack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon_usages")
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String couponCode;

    @Column(nullable = false)
    private Long userId;

    private String userEmail;

    @Column(nullable = false)
    private String orderId;

    @Column(nullable = false)
    private double discountAmount;

    @Column(nullable = false)
    private LocalDateTime usageDateTime;

    public CouponUsage() {}

    public CouponUsage(String couponCode, Long userId, String userEmail, String orderId, double discountAmount, LocalDateTime usageDateTime) {
        this.couponCode = couponCode;
        this.userId = userId;
        this.userEmail = userEmail;
        this.orderId = orderId;
        this.discountAmount = discountAmount;
        this.usageDateTime = usageDateTime;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(double discountAmount) { this.discountAmount = discountAmount; }

    public LocalDateTime getUsageDateTime() { return usageDateTime; }
    public void setUsageDateTime(LocalDateTime usageDateTime) { this.usageDateTime = usageDateTime; }
}
