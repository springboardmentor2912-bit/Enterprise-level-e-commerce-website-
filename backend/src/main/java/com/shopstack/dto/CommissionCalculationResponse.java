package com.shopstack.dto;

public class CommissionCalculationResponse {
    private Double orderAmount;
    private Double commissionRate;
    private Double commissionAmount;
    private Double vendorAmount;
    private Long vendorId;
    private String vendorStoreName;
    private String formulaExplanation;

    public CommissionCalculationResponse() {}

    public CommissionCalculationResponse(Double orderAmount, Double commissionRate, Double commissionAmount, Double vendorAmount, String formulaExplanation) {
        this.orderAmount = orderAmount;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.vendorAmount = vendorAmount;
        this.formulaExplanation = formulaExplanation;
    }

    public CommissionCalculationResponse(Double orderAmount, Double commissionRate, Double commissionAmount, Double vendorAmount, Long vendorId, String vendorStoreName, String formulaExplanation) {
        this.orderAmount = orderAmount;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.vendorAmount = vendorAmount;
        this.vendorId = vendorId;
        this.vendorStoreName = vendorStoreName;
        this.formulaExplanation = formulaExplanation;
    }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Double getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Double commissionAmount) { this.commissionAmount = commissionAmount; }

    public Double getVendorAmount() { return vendorAmount; }
    public void setVendorAmount(Double vendorAmount) { this.vendorAmount = vendorAmount; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorStoreName() { return vendorStoreName; }
    public void setVendorStoreName(String vendorStoreName) { this.vendorStoreName = vendorStoreName; }

    public String getFormulaExplanation() { return formulaExplanation; }
    public void setFormulaExplanation(String formulaExplanation) { this.formulaExplanation = formulaExplanation; }
}
