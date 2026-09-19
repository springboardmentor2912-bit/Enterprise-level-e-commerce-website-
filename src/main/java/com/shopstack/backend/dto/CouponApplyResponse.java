package com.shopstack.backend.dto;

public class CouponApplyResponse {

    private String couponCode;

    private Double cartAmount;

    private Double discountAmount;

    private Double finalAmount;

    private String message;


    public CouponApplyResponse() {
    }


    public CouponApplyResponse(
            String couponCode,
            Double cartAmount,
            Double discountAmount,
            Double finalAmount,
            String message
    ) {
        this.couponCode = couponCode;
        this.cartAmount = cartAmount;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
        this.message = message;
    }


    public String getCouponCode() {
        return couponCode;
    }

    public Double getCartAmount() {
        return cartAmount;
    }

    public Double getDiscountAmount() {
        return discountAmount;
    }

    public Double getFinalAmount() {
        return finalAmount;
    }

    public String getMessage() {
        return message;
    }
}