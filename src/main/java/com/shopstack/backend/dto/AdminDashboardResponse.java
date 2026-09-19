package com.shopstack.backend.dto;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalVendors;
    private long totalProducts;
    private long totalOrders;
    private double totalSales;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalUsers,
            long totalVendors,
            long totalProducts,
            long totalOrders,
            double totalSales
    ) {
        this.totalUsers = totalUsers;
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
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

    public double getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(double totalSales) {
        this.totalSales = totalSales;
    }
}