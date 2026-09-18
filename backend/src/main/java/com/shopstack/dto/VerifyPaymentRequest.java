package com.shopstack.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class VerifyPaymentRequest {

    @NotBlank(message = "Razorpay order ID is required")
    @JsonProperty("razorpay_order_id")
    @JsonAlias({"razorpayOrderId", "order_id", "orderId"})
    private String razorpay_order_id;

    @NotBlank(message = "Razorpay payment ID is required")
    @JsonProperty("razorpay_payment_id")
    @JsonAlias({"razorpayPaymentId", "payment_id", "paymentId"})
    private String razorpay_payment_id;

    @NotBlank(message = "Razorpay signature is required")
    @JsonProperty("razorpay_signature")
    @JsonAlias({"razorpaySignature", "signature"})
    private String razorpay_signature;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    private String couponCode;

    public VerifyPaymentRequest() {
    }

    public VerifyPaymentRequest(String razorpay_order_id, String razorpay_payment_id, String razorpay_signature, String shippingAddress) {
        this.razorpay_order_id = razorpay_order_id;
        this.razorpay_payment_id = razorpay_payment_id;
        this.razorpay_signature = razorpay_signature;
        this.shippingAddress = shippingAddress;
    }

    public String getRazorpay_order_id() {
        return razorpay_order_id;
    }

    public void setRazorpay_order_id(String razorpay_order_id) {
        this.razorpay_order_id = razorpay_order_id;
    }

    public String getRazorpay_payment_id() {
        return razorpay_payment_id;
    }

    public void setRazorpay_payment_id(String razorpay_payment_id) {
        this.razorpay_payment_id = razorpay_payment_id;
    }

    public String getRazorpay_signature() {
        return razorpay_signature;
    }

    public void setRazorpay_signature(String razorpay_signature) {
        this.razorpay_signature = razorpay_signature;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}
