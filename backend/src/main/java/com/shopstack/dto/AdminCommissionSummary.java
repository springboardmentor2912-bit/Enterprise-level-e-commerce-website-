package com.shopstack.dto;

import java.util.List;

public class AdminCommissionSummary {
    private double totalGrossSales;
    private double totalCommissionEarned;
    private double totalVendorPayouts;
    private double averageCommissionRate;
    private List<VendorCommissionLine> vendorCommissions;

    public AdminCommissionSummary() {}

    public AdminCommissionSummary(double totalGrossSales, double totalCommissionEarned, double totalVendorPayouts, double averageCommissionRate, List<VendorCommissionLine> vendorCommissions) {
        this.totalGrossSales = totalGrossSales;
        this.totalCommissionEarned = totalCommissionEarned;
        this.totalVendorPayouts = totalVendorPayouts;
        this.averageCommissionRate = averageCommissionRate;
        this.vendorCommissions = vendorCommissions;
    }

    public double getTotalGrossSales() { return totalGrossSales; }
    public void setTotalGrossSales(double totalGrossSales) { this.totalGrossSales = totalGrossSales; }

    public double getTotalCommissionEarned() { return totalCommissionEarned; }
    public void setTotalCommissionEarned(double totalCommissionEarned) { this.totalCommissionEarned = totalCommissionEarned; }

    public double getTotalVendorPayouts() { return totalVendorPayouts; }
    public void setTotalVendorPayouts(double totalVendorPayouts) { this.totalVendorPayouts = totalVendorPayouts; }

    public double getAverageCommissionRate() { return averageCommissionRate; }
    public void setAverageCommissionRate(double averageCommissionRate) { this.averageCommissionRate = averageCommissionRate; }

    public List<VendorCommissionLine> getVendorCommissions() { return vendorCommissions; }
    public void setVendorCommissions(List<VendorCommissionLine> vendorCommissions) { this.vendorCommissions = vendorCommissions; }

    public static class VendorCommissionLine {
        private Long vendorId;
        private String storeName;
        private String ownerName;
        private String ownerEmail;
        private double commissionRate;
        private long totalOrders;
        private double grossSales;
        private double commissionAmount;
        private double payableToVendor;
        private String payoutStatus;

        public VendorCommissionLine() {}

        public VendorCommissionLine(Long vendorId, String storeName, String ownerName, String ownerEmail, double commissionRate, long totalOrders, double grossSales, double commissionAmount, double payableToVendor, String payoutStatus) {
            this.vendorId = vendorId;
            this.storeName = storeName;
            this.ownerName = ownerName;
            this.ownerEmail = ownerEmail;
            this.commissionRate = commissionRate;
            this.totalOrders = totalOrders;
            this.grossSales = grossSales;
            this.commissionAmount = commissionAmount;
            this.payableToVendor = payableToVendor;
            this.payoutStatus = payoutStatus;
        }

        public Long getVendorId() { return vendorId; }
        public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

        public String getStoreName() { return storeName; }
        public void setStoreName(String storeName) { this.storeName = storeName; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

        public double getCommissionRate() { return commissionRate; }
        public void setCommissionRate(double commissionRate) { this.commissionRate = commissionRate; }

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

        public double getGrossSales() { return grossSales; }
        public void setGrossSales(double grossSales) { this.grossSales = grossSales; }

        public double getCommissionAmount() { return commissionAmount; }
        public void setCommissionAmount(double commissionAmount) { this.commissionAmount = commissionAmount; }

        public double getPayableToVendor() { return payableToVendor; }
        public void setPayableToVendor(double payableToVendor) { this.payableToVendor = payableToVendor; }

        public String getPayoutStatus() { return payoutStatus; }
        public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }
    }
}
