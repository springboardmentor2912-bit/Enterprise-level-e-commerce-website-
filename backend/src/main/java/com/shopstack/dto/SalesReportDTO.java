package com.shopstack.dto;

import java.math.BigDecimal;
import java.util.List;

public class SalesReportDTO {

    private BigDecimal totalGrossSales;
    private BigDecimal totalDiscountsGiven;
    private BigDecimal totalNetSales;
    private BigDecimal totalPlatformCommission;
    private BigDecimal totalVendorEarnings;
    private long totalCompletedOrders;

    private List<DailySalesDTO> dailySalesBreakdown;

    public SalesReportDTO() {
    }

    public static class DailySalesDTO {
        private String date;
        private long orderCount;
        private BigDecimal totalSales;
        private BigDecimal commissionEarned;

        public DailySalesDTO() {
        }

        public DailySalesDTO(String date, long orderCount, BigDecimal totalSales, BigDecimal commissionEarned) {
            this.date = date;
            this.orderCount = orderCount;
            this.totalSales = totalSales;
            this.commissionEarned = commissionEarned;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public long getOrderCount() {
            return orderCount;
        }

        public void setOrderCount(long orderCount) {
            this.orderCount = orderCount;
        }

        public BigDecimal getTotalSales() {
            return totalSales;
        }

        public void setTotalSales(BigDecimal totalSales) {
            this.totalSales = totalSales;
        }

        public BigDecimal getCommissionEarned() {
            return commissionEarned;
        }

        public void setCommissionEarned(BigDecimal commissionEarned) {
            this.commissionEarned = commissionEarned;
        }
    }

    public BigDecimal getTotalGrossSales() {
        return totalGrossSales;
    }

    public void setTotalGrossSales(BigDecimal totalGrossSales) {
        this.totalGrossSales = totalGrossSales;
    }

    public BigDecimal getTotalDiscountsGiven() {
        return totalDiscountsGiven;
    }

    public void setTotalDiscountsGiven(BigDecimal totalDiscountsGiven) {
        this.totalDiscountsGiven = totalDiscountsGiven;
    }

    public BigDecimal getTotalNetSales() {
        return totalNetSales;
    }

    public void setTotalNetSales(BigDecimal totalNetSales) {
        this.totalNetSales = totalNetSales;
    }

    public BigDecimal getTotalPlatformCommission() {
        return totalPlatformCommission;
    }

    public void setTotalPlatformCommission(BigDecimal totalPlatformCommission) {
        this.totalPlatformCommission = totalPlatformCommission;
    }

    public BigDecimal getTotalVendorEarnings() {
        return totalVendorEarnings;
    }

    public void setTotalVendorEarnings(BigDecimal totalVendorEarnings) {
        this.totalVendorEarnings = totalVendorEarnings;
    }

    public long getTotalCompletedOrders() {
        return totalCompletedOrders;
    }

    public void setTotalCompletedOrders(long totalCompletedOrders) {
        this.totalCompletedOrders = totalCompletedOrders;
    }

    public List<DailySalesDTO> getDailySalesBreakdown() {
        return dailySalesBreakdown;
    }

    public void setDailySalesBreakdown(List<DailySalesDTO> dailySalesBreakdown) {
        this.dailySalesBreakdown = dailySalesBreakdown;
    }
}
