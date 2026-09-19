package com.shopstack.backend.dto;

public class PaymentRequest {

    private Double amount;

    public PaymentRequest() {
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}