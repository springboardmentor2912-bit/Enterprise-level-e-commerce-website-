package com.shopstack.dto;

import java.math.BigDecimal;
import java.util.List;

public class CommissionSummaryDTO {

    private BigDecimal totalOrderVolume;
    private BigDecimal totalPlatformCommission;
    private BigDecimal totalVendorPayouts;
    private List<VendorCommissionDTO> vendorCommissions;

    public CommissionSummaryDTO() {
    }

    public CommissionSummaryDTO(BigDecimal totalOrderVolume, BigDecimal totalPlatformCommission, BigDecimal totalVendorPayouts, List<VendorCommissionDTO> vendorCommissions) {
        this.totalOrderVolume = totalOrderVolume;
        this.totalPlatformCommission = totalPlatformCommission;
        this.totalVendorPayouts = totalVendorPayouts;
        this.vendorCommissions = vendorCommissions;
    }

    public BigDecimal getTotalOrderVolume() {
        return totalOrderVolume;
    }

    public BigDecimal getTotalGrossVolume() {
        return totalOrderVolume;
    }

    public void setTotalOrderVolume(BigDecimal totalOrderVolume) {
        this.totalOrderVolume = totalOrderVolume;
    }

    public BigDecimal getTotalPlatformCommission() {
        return totalPlatformCommission;
    }

    public void setTotalPlatformCommission(BigDecimal totalPlatformCommission) {
        this.totalPlatformCommission = totalPlatformCommission;
    }

    public BigDecimal getTotalVendorPayouts() {
        return totalVendorPayouts;
    }

    public BigDecimal getTotalVendorPayout() {
        return totalVendorPayouts;
    }

    public void setTotalVendorPayouts(BigDecimal totalVendorPayouts) {
        this.totalVendorPayouts = totalVendorPayouts;
    }

    public List<VendorCommissionDTO> getVendorCommissions() {
        return vendorCommissions;
    }

    public void setVendorCommissions(List<VendorCommissionDTO> vendorCommissions) {
        this.vendorCommissions = vendorCommissions;
    }
}
