package com.shopstack.dto;

import com.shopstack.model.DiscountType;
import java.time.LocalDateTime;

public class CouponResponse {

    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private Double discountValue;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private Integer usageLimit;
    private Integer userUsageLimit;
    private Integer usageCount;
    private Boolean active;
    private Boolean isExpired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CouponResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Boolean getIsExpired() { return isExpired; }
    public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
