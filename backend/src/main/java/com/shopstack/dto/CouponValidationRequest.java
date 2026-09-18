package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CouponValidationRequest {

    @NotBlank(message = "Coupon code cannot be blank")
    private String couponCode;

    @NotNull(message = "Order amount cannot be null")
    @Positive(message = "Order amount must be positive")
    private Double orderAmount;

    private Long userId;

    public CouponValidationRequest() {}

    public CouponValidationRequest(String couponCode, Double orderAmount) {
        this.couponCode = couponCode;
        this.orderAmount = orderAmount;
    }

    public CouponValidationRequest(String couponCode, Double orderAmount, Long userId) {
        this.couponCode = couponCode;
        this.orderAmount = orderAmount;
        this.userId = userId;
    }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
