package com.shopstack.dto;

import java.math.BigDecimal;

public class CouponAnalyticsDTO {

    private long totalCoupons;
    private long activeCoupons;
    private long totalRedemptions;
    private BigDecimal totalDiscountGiven;
    private BigDecimal totalRevenueWithCoupons;

    public CouponAnalyticsDTO() {
    }

    public CouponAnalyticsDTO(long totalCoupons, long activeCoupons, long totalRedemptions, BigDecimal totalDiscountGiven, BigDecimal totalRevenueWithCoupons) {
        this.totalCoupons = totalCoupons;
        this.activeCoupons = activeCoupons;
        this.totalRedemptions = totalRedemptions;
        this.totalDiscountGiven = totalDiscountGiven;
        this.totalRevenueWithCoupons = totalRevenueWithCoupons;
    }

    public long getTotalCoupons() {
        return totalCoupons;
    }

    public void setTotalCoupons(long totalCoupons) {
        this.totalCoupons = totalCoupons;
    }

    public long getActiveCoupons() {
        return activeCoupons;
    }

    public void setActiveCoupons(long activeCoupons) {
        this.activeCoupons = activeCoupons;
    }

    public long getTotalRedemptions() {
        return totalRedemptions;
    }

    public void setTotalRedemptions(long totalRedemptions) {
        this.totalRedemptions = totalRedemptions;
    }

    public BigDecimal getTotalDiscountGiven() {
        return totalDiscountGiven;
    }

    public void setTotalDiscountGiven(BigDecimal totalDiscountGiven) {
        this.totalDiscountGiven = totalDiscountGiven;
    }

    public BigDecimal getTotalRevenueWithCoupons() {
        return totalRevenueWithCoupons;
    }

    public void setTotalRevenueWithCoupons(BigDecimal totalRevenueWithCoupons) {
        this.totalRevenueWithCoupons = totalRevenueWithCoupons;
    }
}
