package com.shopstack.shopstack_backend.dto;

public class AdminDashboardResponse {

    private long totalCustomers;
    private long totalVendors;
    private long totalProducts;
    private long totalOrders;
    private double totalRevenue;
    private long pendingOrders;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalCustomers,
            long totalVendors,
            long totalProducts,
            long totalOrders,
            double totalRevenue,
            long pendingOrders
    ) {
        this.totalCustomers = totalCustomers;
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.pendingOrders = pendingOrders;
    }

    public long getTotalCustomers() {
        return totalCustomers;
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

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public long getPendingOrders() {
        return pendingOrders;
    }
}