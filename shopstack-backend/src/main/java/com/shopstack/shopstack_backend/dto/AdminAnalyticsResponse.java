package com.shopstack.shopstack_backend.dto;

public class AdminAnalyticsResponse {

    private long totalVendors;
    private long totalProducts;
    private long totalOrders;
    private double totalSales;

    private long pendingOrders;
    private long confirmedOrders;
    private long deliveredOrders;
    private long cancelledOrders;

    public AdminAnalyticsResponse(
            long totalVendors,
            long totalProducts,
            long totalOrders,
            double totalSales,
            long pendingOrders,
            long confirmedOrders,
            long deliveredOrders,
            long cancelledOrders
    ) {
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
        this.pendingOrders = pendingOrders;
        this.confirmedOrders = confirmedOrders;
        this.deliveredOrders = deliveredOrders;
        this.cancelledOrders = cancelledOrders;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public double getTotalSales() {
        return totalSales;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }

    public long getConfirmedOrders() {
        return confirmedOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public long getCancelledOrders() {
        return cancelledOrders;
    }
}