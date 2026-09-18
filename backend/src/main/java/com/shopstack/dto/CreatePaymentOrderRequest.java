package com.shopstack.dto;

public class CreatePaymentOrderRequest {

    private String couponCode;

    public CreatePaymentOrderRequest() {
    }

    public CreatePaymentOrderRequest(String couponCode) {
        this.couponCode = couponCode;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
