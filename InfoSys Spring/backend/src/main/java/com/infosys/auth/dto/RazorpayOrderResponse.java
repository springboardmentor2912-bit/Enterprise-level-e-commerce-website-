package com.infosys.auth.dto;

import java.math.BigDecimal;

public class RazorpayOrderResponse {
    private String razorpayOrderId;
    private String razorpayKeyId;
    private Long orderId;
    private BigDecimal amount;
    private String currency;
    private String customerName;
    private String shippingAddress;
    private String mode; // "TEST"

    public RazorpayOrderResponse() {}

    public RazorpayOrderResponse(String razorpayOrderId, String razorpayKeyId, Long orderId,
                                 BigDecimal amount, String currency, String customerName,
                                 String shippingAddress, String mode) {
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayKeyId = razorpayKeyId;
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.customerName = customerName;
        this.shippingAddress = shippingAddress;
        this.mode = mode;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }

    public void setRazorpayKeyId(String razorpayKeyId) {
        this.razorpayKeyId = razorpayKeyId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
