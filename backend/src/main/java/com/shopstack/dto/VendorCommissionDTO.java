package com.shopstack.dto;

import java.math.BigDecimal;

public class VendorCommissionDTO {

    private Long vendorId;
    private String businessName;
    private String email;
    private BigDecimal commissionRate;
    private long totalItemsSold;
    private BigDecimal totalGrossSales;
    private BigDecimal platformCommissionDeducted;
    private BigDecimal netVendorEarnings;

    public VendorCommissionDTO() {
    }

    public VendorCommissionDTO(Long vendorId, String businessName, String email, BigDecimal commissionRate, long totalItemsSold, BigDecimal totalGrossSales, BigDecimal platformCommissionDeducted, BigDecimal netVendorEarnings) {
        this.vendorId = vendorId;
        this.businessName = businessName;
        this.email = email;
        this.commissionRate = commissionRate;
        this.totalItemsSold = totalItemsSold;
        this.totalGrossSales = totalGrossSales;
        this.platformCommissionDeducted = platformCommissionDeducted;
        this.netVendorEarnings = netVendorEarnings;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }

    public long getTotalItemsSold() {
        return totalItemsSold;
    }

    public long getTotalOrdersSold() {
        return totalItemsSold;
    }

    public void setTotalItemsSold(long totalItemsSold) {
        this.totalItemsSold = totalItemsSold;
    }

    public BigDecimal getTotalGrossSales() {
        return totalGrossSales;
    }

    public void setTotalGrossSales(BigDecimal totalGrossSales) {
        this.totalGrossSales = totalGrossSales;
    }

    public BigDecimal getPlatformCommissionDeducted() {
        return platformCommissionDeducted;
    }

    public BigDecimal getTotalCommissionDeducted() {
        return platformCommissionDeducted;
    }

    public void setPlatformCommissionDeducted(BigDecimal platformCommissionDeducted) {
        this.platformCommissionDeducted = platformCommissionDeducted;
    }

    public BigDecimal getNetVendorEarnings() {
        return netVendorEarnings;
    }

    public void setNetVendorEarnings(BigDecimal netVendorEarnings) {
        this.netVendorEarnings = netVendorEarnings;
    }
}
