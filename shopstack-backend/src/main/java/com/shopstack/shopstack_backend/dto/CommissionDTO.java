package com.shopstack.shopstack_backend.dto;

public class CommissionDTO {

    private Long vendorId;
    private String vendorName;
    private String vendorEmail;

    private double totalSales;
    private double commissionRate;
    private double commissionAmount;
    private double vendorEarnings;

    public CommissionDTO() {
    }

    public CommissionDTO(
            Long vendorId,
            String vendorName,
            String vendorEmail,
            double totalSales,
            double commissionRate,
            double commissionAmount,
            double vendorEarnings) {

        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.vendorEmail = vendorEmail;
        this.totalSales = totalSales;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.vendorEarnings = vendorEarnings;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public String getVendorEmail() {
        return vendorEmail;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public double getCommissionRate() {
        return commissionRate;
    }

    public double getCommissionAmount() {
        return commissionAmount;
    }

    public double getVendorEarnings() {
        return vendorEarnings;
    }
}