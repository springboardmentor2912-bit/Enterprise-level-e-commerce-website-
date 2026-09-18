package com.shopstack.dto;

import java.math.BigDecimal;

public class VendorPerformanceDTO {

    private Long vendorId;
    private String businessName;
    private String email;
    private String phone;
    private Boolean active;
    private BigDecimal commissionRate;
    private long totalProducts;
    private long totalOrdersSold;
    private BigDecimal totalGrossSales;
    private BigDecimal totalCommissionDeducted;
    private BigDecimal netVendorEarnings;

    public VendorPerformanceDTO() {
    }

    public VendorPerformanceDTO(Long vendorId, String businessName, String email, String phone, Boolean active, BigDecimal commissionRate, long totalProducts, long totalOrdersSold, BigDecimal totalGrossSales, BigDecimal totalCommissionDeducted, BigDecimal netVendorEarnings) {
        this.vendorId = vendorId;
        this.businessName = businessName;
        this.email = email;
        this.phone = phone;
        this.active = active;
        this.commissionRate = commissionRate;
        this.totalProducts = totalProducts;
        this.totalOrdersSold = totalOrdersSold;
        this.totalGrossSales = totalGrossSales;
        this.totalCommissionDeducted = totalCommissionDeducted;
        this.netVendorEarnings = netVendorEarnings;
    }

    public VendorPerformanceDTO(Long vendorId, String businessName, String email, String phone, BigDecimal commissionRate, long totalProducts, long totalOrdersSold, BigDecimal totalGrossSales, BigDecimal totalCommissionDeducted, BigDecimal netVendorEarnings) {
        this(vendorId, businessName, email, phone, true, commissionRate, totalProducts, totalOrdersSold, totalGrossSales, totalCommissionDeducted, netVendorEarnings);
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalOrdersSold() {
        return totalOrdersSold;
    }

    public void setTotalOrdersSold(long totalOrdersSold) {
        this.totalOrdersSold = totalOrdersSold;
    }

    public BigDecimal getTotalGrossSales() {
        return totalGrossSales;
    }

    public void setTotalGrossSales(BigDecimal totalGrossSales) {
        this.totalGrossSales = totalGrossSales;
    }

    public BigDecimal getTotalCommissionDeducted() {
        return totalCommissionDeducted;
    }

    public void setTotalCommissionDeducted(BigDecimal totalCommissionDeducted) {
        this.totalCommissionDeducted = totalCommissionDeducted;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public BigDecimal getNetVendorEarnings() {
        return netVendorEarnings;
    }

    public void setNetVendorEarnings(BigDecimal netVendorEarnings) {
        this.netVendorEarnings = netVendorEarnings;
    }
}
