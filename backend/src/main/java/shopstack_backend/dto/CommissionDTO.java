package shopstack_backend.dto;

import java.math.BigDecimal;

public class CommissionDTO {
    private Long vendorId;
    private String vendorName;
    private BigDecimal totalVendorSales;
    private double commissionPercentage;
    private BigDecimal totalCommissionEarned;

    public CommissionDTO() {}

    public CommissionDTO(Long vendorId, String vendorName, BigDecimal totalVendorSales, double commissionPercentage, BigDecimal totalCommissionEarned) {
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.totalVendorSales = totalVendorSales;
        this.commissionPercentage = commissionPercentage;
        this.totalCommissionEarned = totalCommissionEarned;
    }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public BigDecimal getTotalVendorSales() { return totalVendorSales; }
    public void setTotalVendorSales(BigDecimal totalVendorSales) { this.totalVendorSales = totalVendorSales; }

    public double getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(double commissionPercentage) { this.commissionPercentage = commissionPercentage; }

    public BigDecimal getTotalCommissionEarned() { return totalCommissionEarned; }
    public void setTotalCommissionEarned(BigDecimal totalCommissionEarned) { this.totalCommissionEarned = totalCommissionEarned; }
}