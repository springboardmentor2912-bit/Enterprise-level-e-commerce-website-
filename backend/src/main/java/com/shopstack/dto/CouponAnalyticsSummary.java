package com.shopstack.dto;

import java.util.ArrayList;
import java.util.List;

public class CouponAnalyticsSummary {

    private long totalCoupons;
    private long activeCoupons;
    private long totalRedemptions;
    private double totalDiscountsGiven;
    private double averageDiscountPerRedemption;
    private List<TopCouponMetric> topPerformingCoupons = new ArrayList<>();

    public CouponAnalyticsSummary() {}

    public static class TopCouponMetric {
        private Long couponId;
        private String code;
        private String discountType;
        private Double discountValue;
        private long usageCount;
        private double totalDiscountProvided;

        public TopCouponMetric() {}

        public TopCouponMetric(Long couponId, String code, String discountType, Double discountValue, long usageCount, double totalDiscountProvided) {
            this.couponId = couponId;
            this.code = code;
            this.discountType = discountType;
            this.discountValue = discountValue;
            this.usageCount = usageCount;
            this.totalDiscountProvided = totalDiscountProvided;
        }

        public Long getCouponId() { return couponId; }
        public void setCouponId(Long couponId) { this.couponId = couponId; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDiscountType() { return discountType; }
        public void setDiscountType(String discountType) { this.discountType = discountType; }

        public Double getDiscountValue() { return discountValue; }
        public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

        public long getUsageCount() { return usageCount; }
        public void setUsageCount(long usageCount) { this.usageCount = usageCount; }

        public double getTotalDiscountProvided() { return totalDiscountProvided; }
        public void setTotalDiscountProvided(double totalDiscountProvided) { this.totalDiscountProvided = totalDiscountProvided; }
    }

    public long getTotalCoupons() { return totalCoupons; }
    public void setTotalCoupons(long totalCoupons) { this.totalCoupons = totalCoupons; }

    public long getActiveCoupons() { return activeCoupons; }
    public void setActiveCoupons(long activeCoupons) { this.activeCoupons = activeCoupons; }

    public long getTotalRedemptions() { return totalRedemptions; }
    public void setTotalRedemptions(long totalRedemptions) { this.totalRedemptions = totalRedemptions; }

    public double getTotalDiscountsGiven() { return totalDiscountsGiven; }
    public void setTotalDiscountsGiven(double totalDiscountsGiven) { this.totalDiscountsGiven = totalDiscountsGiven; }

    public double getAverageDiscountPerRedemption() { return averageDiscountPerRedemption; }
    public void setAverageDiscountPerRedemption(double averageDiscountPerRedemption) { this.averageDiscountPerRedemption = averageDiscountPerRedemption; }

    public List<TopCouponMetric> getTopPerformingCoupons() { return topPerformingCoupons; }
    public void setTopPerformingCoupons(List<TopCouponMetric> topPerformingCoupons) { this.topPerformingCoupons = topPerformingCoupons; }
}
