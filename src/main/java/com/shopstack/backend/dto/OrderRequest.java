package com.shopstack.backend.dto;

public class OrderRequest {

    private Long addressId;

    private String paymentMethod;

    private String paymentStatus;

    private String razorpayPaymentId;

    private String razorpayOrderId;

    private String couponCode;


    public OrderRequest() {
    }


    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }


    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }


    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(
            String razorpayPaymentId
    ) {
        this.razorpayPaymentId =
                razorpayPaymentId;
    }


    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(
            String razorpayOrderId
    ) {
        this.razorpayOrderId =
                razorpayOrderId;
    }


    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(
            String couponCode
    ) {
        this.couponCode = couponCode;
    }
}