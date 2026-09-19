package com.shopstack.backend.dto;

public class CouponAnalyticsResponse {

    private Long couponId;
    private String couponCode;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer remainingUses;
    private Double totalDiscount;
    private Boolean active;

    public CouponAnalyticsResponse() {
    }

    public CouponAnalyticsResponse(
            Long couponId,
            String couponCode,
            Integer usageLimit,
            Integer usedCount,
            Integer remainingUses,
            Double totalDiscount,
            Boolean active
    ) {
        this.couponId = couponId;
        this.couponCode = couponCode;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
        this.remainingUses = remainingUses;
        this.totalDiscount = totalDiscount;
        this.active = active;
    }

    public Long getCouponId() {
        return couponId;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public Integer getUsedCount() {
        return usedCount;
    }

    public Integer getRemainingUses() {
        return remainingUses;
    }

    public Double getTotalDiscount() {
        return totalDiscount;
    }

    public Boolean getActive() {
        return active;
    }
}