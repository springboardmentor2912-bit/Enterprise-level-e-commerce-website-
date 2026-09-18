package com.shopstack.dto;

import com.shopstack.model.DiscountType;

public class CouponValidationResponse {

    private boolean valid;
    private String couponCode;
    private String description;
    private DiscountType discountType;
    private Double discountValue;
    private Double discountAmount;
    private Double orderAmount;
    private Double finalAmount;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private String message;

    public CouponValidationResponse() {}

    public static CouponValidationResponse invalid(String code, String message) {
        CouponValidationResponse res = new CouponValidationResponse();
        res.setValid(false);
        res.setCouponCode(code);
        res.setMessage(message);
        res.setDiscountAmount(0.0);
        return res;
    }

    public static CouponValidationResponse valid(String code, String description, DiscountType discountType,
                                                  Double discountValue, Double discountAmount, Double orderAmount,
                                                  Double finalAmount, Double minOrderAmount, Double maxDiscountAmount,
                                                  String message) {
        CouponValidationResponse res = new CouponValidationResponse();
        res.setValid(true);
        res.setCouponCode(code);
        res.setDescription(description);
        res.setDiscountType(discountType);
        res.setDiscountValue(discountValue);
        res.setDiscountAmount(discountAmount);
        res.setOrderAmount(orderAmount);
        res.setFinalAmount(finalAmount);
        res.setMinOrderAmount(minOrderAmount);
        res.setMaxDiscountAmount(maxDiscountAmount);
        res.setMessage(message);
        return res;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
