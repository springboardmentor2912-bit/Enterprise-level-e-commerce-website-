package com.shopstack.backend.dto;

public class ApplyCouponRequest {

    private String couponCode;

    private Double cartAmount;


    public ApplyCouponRequest() {
    }


    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }


    public Double getCartAmount() {
        return cartAmount;
    }

    public void setCartAmount(Double cartAmount) {
        this.cartAmount = cartAmount;
    }
}