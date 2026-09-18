package com.shopstack.dto;

public class CommissionCalculationRequest {
    private Double orderAmount;
    private Double commissionRate;
    private Long vendorId;

    public CommissionCalculationRequest() {}

    public CommissionCalculationRequest(Double orderAmount, Double commissionRate) {
        this.orderAmount = orderAmount;
        this.commissionRate = commissionRate;
    }

    public CommissionCalculationRequest(Double orderAmount, Double commissionRate, Long vendorId) {
        this.orderAmount = orderAmount;
        this.commissionRate = commissionRate;
        this.vendorId = vendorId;
    }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
}
