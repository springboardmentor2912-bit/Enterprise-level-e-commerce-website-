
package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;

public class AdminReportResponse {

    private long totalUsers;
    private long totalCustomers;
    private long totalVendors;
    private long totalProducts;
    private long totalOrders;

    private BigDecimal totalSales;

    private long pendingOrders;
    private long confirmedOrders;
    private long shippedOrders;
    private long deliveredOrders;

    public AdminReportResponse() {
    }

    public AdminReportResponse(
            long totalUsers,
            long totalCustomers,
            long totalVendors,
            long totalProducts,
            long totalOrders,
            BigDecimal totalSales,
            long pendingOrders,
            long confirmedOrders,
            long shippedOrders,
            long deliveredOrders) {

        this.totalUsers = totalUsers;
        this.totalCustomers = totalCustomers;
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.shippedOrders = shippedOrders;
        this.deliveredOrders = deliveredOrders;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(BigDecimal totalSales) {
        this.totalSales = totalSales;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public long getConfirmedOrders() {
        return confirmedOrders;
    }

    public void setConfirmedOrders(long confirmedOrders) {
        this.confirmedOrders = confirmedOrders;
    }

    public long getShippedOrders() {
        return shippedOrders;
    }

    public void setShippedOrders(long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }
}

