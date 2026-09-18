package com.shopstack.dto;

import java.util.List;

public class PaymentOrderResponse {
    private String razorpayOrderId;
    private String keyId;
    private Long amountInPaise;
    private Double amountInRupees;
    private String currency;
    private String status;
    private String paymentMethod;
    private List<Long> orderIds;

    public PaymentOrderResponse() {}

    public PaymentOrderResponse(String razorpayOrderId, String keyId, Long amountInPaise, Double amountInRupees, String currency, String status, List<Long> orderIds) {
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amountInPaise = amountInPaise;
        this.amountInRupees = amountInRupees;
        this.currency = currency;
        this.status = status;
        this.orderIds = orderIds;
    }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public Long getAmountInPaise() { return amountInPaise; }
    public void setAmountInPaise(Long amountInPaise) { this.amountInPaise = amountInPaise; }

    public Double getAmountInRupees() { return amountInRupees; }
    public void setAmountInRupees(Double amountInRupees) { this.amountInRupees = amountInRupees; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<Long> getOrderIds() { return orderIds; }
    public void setOrderIds(List<Long> orderIds) { this.orderIds = orderIds; }
}
