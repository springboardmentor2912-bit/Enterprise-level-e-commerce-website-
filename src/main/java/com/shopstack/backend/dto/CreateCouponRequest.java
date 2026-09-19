package com.shopstack.backend.dto;

import com.shopstack.backend.enums.DiscountType;
import java.util.List;

import java.time.LocalDateTime;

public class CreateCouponRequest {

    private String code;

    private DiscountType discountType;

    private Double discountValue;

    private Double minimumOrderAmount;

    private Double maximumDiscount;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private Integer usageLimit;

    private Boolean active;


    public CreateCouponRequest() {
    }


    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }


    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }


    public Double getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(Double discountValue) {
        this.discountValue = discountValue;
    }


    public Double getMinimumOrderAmount() {
        return minimumOrderAmount;
    }

    public void setMinimumOrderAmount(Double minimumOrderAmount) {
        this.minimumOrderAmount = minimumOrderAmount;
    }


    public Double getMaximumDiscount() {
        return maximumDiscount;
    }

    public void setMaximumDiscount(Double maximumDiscount) {
        this.maximumDiscount = maximumDiscount;
    }


    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }


    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }


    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }


    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    private Long vendorId;

    private List<Long> productIds;

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public List<Long> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Long> productIds) {
        this.productIds = productIds;
    }

}