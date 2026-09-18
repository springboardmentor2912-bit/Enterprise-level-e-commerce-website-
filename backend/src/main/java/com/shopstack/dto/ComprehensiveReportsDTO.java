package com.shopstack.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ComprehensiveReportsDTO {

    private SalesReportDTO salesReport;
    private CommissionSummaryDTO commissionReport;
    private ProductOrderStatsDTO productPerformanceReport;
    private List<VendorPerformanceDTO> vendorPerformanceReport;
    private OrderReportSummary orderReport;
    private RevenueReportSummary revenueReport;

    public ComprehensiveReportsDTO() {
    }

    public static class OrderReportSummary {
        private long totalOrders;
        private long completedOrders;
        private long cancelledOrders;
        private BigDecimal averageOrderValue;
        private Map<String, Long> ordersByStatus;

        public OrderReportSummary() {
        }

        public OrderReportSummary(long totalOrders, long completedOrders, long cancelledOrders, BigDecimal averageOrderValue, Map<String, Long> ordersByStatus) {
            this.totalOrders = totalOrders;
            this.completedOrders = completedOrders;
            this.cancelledOrders = cancelledOrders;
            this.averageOrderValue = averageOrderValue;
            this.ordersByStatus = ordersByStatus;
        }

        public long getTotalOrders() {
            return totalOrders;
        }

        public void setTotalOrders(long totalOrders) {
            this.totalOrders = totalOrders;
        }

        public long getCompletedOrders() {
            return completedOrders;
        }

        public void setCompletedOrders(long completedOrders) {
            this.completedOrders = completedOrders;
        }

        public long getCancelledOrders() {
            return cancelledOrders;
        }

        public void setCancelledOrders(long cancelledOrders) {
            this.cancelledOrders = cancelledOrders;
        }

        public BigDecimal getAverageOrderValue() {
            return averageOrderValue;
        }

        public void setAverageOrderValue(BigDecimal averageOrderValue) {
            this.averageOrderValue = averageOrderValue;
        }

        public Map<String, Long> getOrdersByStatus() {
            return ordersByStatus;
        }

        public void setOrdersByStatus(Map<String, Long> ordersByStatus) {
            this.ordersByStatus = ordersByStatus;
        }
    }

    public static class RevenueReportSummary {
        private BigDecimal grossRevenue;
        private BigDecimal totalDiscounts;
        private BigDecimal netRevenue;
        private BigDecimal platformCommissionEarnings;
        private BigDecimal totalVendorPayouts;

        public RevenueReportSummary() {
        }

        public RevenueReportSummary(BigDecimal grossRevenue, BigDecimal totalDiscounts, BigDecimal netRevenue, BigDecimal platformCommissionEarnings, BigDecimal totalVendorPayouts) {
            this.grossRevenue = grossRevenue;
            this.totalDiscounts = totalDiscounts;
            this.netRevenue = netRevenue;
            this.platformCommissionEarnings = platformCommissionEarnings;
            this.totalVendorPayouts = totalVendorPayouts;
        }

        public BigDecimal getGrossRevenue() {
            return grossRevenue;
        }

        public void setGrossRevenue(BigDecimal grossRevenue) {
            this.grossRevenue = grossRevenue;
        }

        public BigDecimal getTotalDiscounts() {
            return totalDiscounts;
        }

        public void setTotalDiscounts(BigDecimal totalDiscounts) {
            this.totalDiscounts = totalDiscounts;
        }

        public BigDecimal getNetRevenue() {
            return netRevenue;
        }

        public void setNetRevenue(BigDecimal netRevenue) {
            this.netRevenue = netRevenue;
        }

        public BigDecimal getPlatformCommissionEarnings() {
            return platformCommissionEarnings;
        }

        public void setPlatformCommissionEarnings(BigDecimal platformCommissionEarnings) {
            this.platformCommissionEarnings = platformCommissionEarnings;
        }

        public BigDecimal getTotalVendorPayouts() {
            return totalVendorPayouts;
        }

        public void setTotalVendorPayouts(BigDecimal totalVendorPayouts) {
            this.totalVendorPayouts = totalVendorPayouts;
        }
    }

    public SalesReportDTO getSalesReport() {
        return salesReport;
    }

    public void setSalesReport(SalesReportDTO salesReport) {
        this.salesReport = salesReport;
    }

    public CommissionSummaryDTO getCommissionReport() {
        return commissionReport;
    }

    public void setCommissionReport(CommissionSummaryDTO commissionReport) {
        this.commissionReport = commissionReport;
    }

    public ProductOrderStatsDTO getProductPerformanceReport() {
        return productPerformanceReport;
    }

    public void setProductPerformanceReport(ProductOrderStatsDTO productPerformanceReport) {
        this.productPerformanceReport = productPerformanceReport;
    }

    public List<VendorPerformanceDTO> getVendorPerformanceReport() {
        return vendorPerformanceReport;
    }

    public void setVendorPerformanceReport(List<VendorPerformanceDTO> vendorPerformanceReport) {
        this.vendorPerformanceReport = vendorPerformanceReport;
    }

    public OrderReportSummary getOrderReport() {
        return orderReport;
    }

    public void setOrderReport(OrderReportSummary orderReport) {
        this.orderReport = orderReport;
    }

    public RevenueReportSummary getRevenueReport() {
        return revenueReport;
    }

    public void setRevenueReport(RevenueReportSummary revenueReport) {
        this.revenueReport = revenueReport;
    }
}
