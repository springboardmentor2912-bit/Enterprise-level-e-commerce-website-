package com.shopstack.dto;

import com.shopstack.model.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public class CouponRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    private String description;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be greater than zero")
    private Double discountValue;

    private Double minOrderAmount;

    private Double maxDiscountAmount;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private Integer usageLimit;

    private Integer userUsageLimit = 1;

    private Boolean active = true;

    public CouponRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUserUsageLimit() { return userUsageLimit; }
    public void setUserUsageLimit(Integer userUsageLimit) { this.userUsageLimit = userUsageLimit; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
