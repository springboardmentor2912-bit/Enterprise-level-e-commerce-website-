package shopstack_backend.dto;

import java.math.BigDecimal;

public class CouponAnalyticsDTO {

    private Long couponId;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private boolean active;
    private Integer usageLimit;
    private int usageCount;
    private BigDecimal totalDiscountGiven;

    public CouponAnalyticsDTO() {
    }

    public Long getCouponId() {
        return couponId;
    }

    public void setCouponId(Long couponId) {
        this.couponId = couponId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public int getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(int usageCount) {
        this.usageCount = usageCount;
    }

    public BigDecimal getTotalDiscountGiven() {
        return totalDiscountGiven;
    }

    public void setTotalDiscountGiven(BigDecimal totalDiscountGiven) {
        this.totalDiscountGiven = totalDiscountGiven;
    }
}