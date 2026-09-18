package com.shopstack.dto;

import java.math.BigDecimal;

public class PaymentOrderResponse {

    private String key;
    private String razorpayOrderId;
    private long amount; // in paise
    private BigDecimal amountInRupees;
    private String currency;

    public PaymentOrderResponse() {
    }

    public PaymentOrderResponse(String key, String razorpayOrderId, long amount, BigDecimal amountInRupees, String currency) {
        this.key = key;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.amountInRupees = amountInRupees;
        this.currency = currency;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public long getAmount() {
        return amount;
    }

    public void setAmount(long amount) {
        this.amount = amount;
    }

    public BigDecimal getAmountInRupees() {
        return amountInRupees;
    }

    public void setAmountInRupees(BigDecimal amountInRupees) {
        this.amountInRupees = amountInRupees;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
