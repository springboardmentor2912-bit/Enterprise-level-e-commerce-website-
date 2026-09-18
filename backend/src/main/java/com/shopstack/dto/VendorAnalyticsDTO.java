package com.shopstack.dto;

import java.math.BigDecimal;

public class VendorAnalyticsDTO {

    private long totalProducts;
    private long totalSalesCount;
    private BigDecimal totalRevenue;
    private long pendingApprovals;
    private long lowStockProducts;

    public VendorAnalyticsDTO() {
    }

    public VendorAnalyticsDTO(long totalProducts, long totalSalesCount, BigDecimal totalRevenue, long pendingApprovals, long lowStockProducts) {
        this.totalProducts = totalProducts;
        this.totalSalesCount = totalSalesCount;
        this.totalRevenue = totalRevenue;
        this.pendingApprovals = pendingApprovals;
        this.lowStockProducts = lowStockProducts;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalSalesCount() {
        return totalSalesCount;
    }

    public void setTotalSalesCount(long totalSalesCount) {
        this.totalSalesCount = totalSalesCount;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(long lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }
}
