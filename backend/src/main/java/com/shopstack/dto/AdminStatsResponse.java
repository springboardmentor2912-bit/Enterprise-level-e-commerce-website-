package com.shopstack.dto;

public class AdminStatsResponse {
    private long totalProducts;
    private long outOfStockProducts;
    private long totalCustomers;
    private long activeUsers;
    private long totalVendors;
    private long pendingVendors;
    private long totalOrders;
    private long completedOrders;
    private long pendingOrders;
    private long paidTransactions;
    private double totalRevenue;
    private double totalCommissionEarned;
    private double totalVendorPayouts;
    private double averageOrderValue;

    public AdminStatsResponse() {}

    public AdminStatsResponse(long totalProducts, long outOfStockProducts, long totalCustomers, long activeUsers,
                              long totalVendors, long pendingVendors, long totalOrders, long completedOrders,
                              long pendingOrders, long paidTransactions, double totalRevenue,
                              double totalCommissionEarned, double totalVendorPayouts, double averageOrderValue) {
        this.totalProducts = totalProducts;
        this.outOfStockProducts = outOfStockProducts;
        this.totalCustomers = totalCustomers;
        this.activeUsers = activeUsers;
        this.totalVendors = totalVendors;
        this.pendingVendors = pendingVendors;
        this.totalOrders = totalOrders;
        this.completedOrders = completedOrders;
        this.pendingOrders = pendingOrders;
        this.paidTransactions = paidTransactions;
        this.totalRevenue = totalRevenue;
        this.totalCommissionEarned = totalCommissionEarned;
        this.totalVendorPayouts = totalVendorPayouts;
        this.averageOrderValue = averageOrderValue;
    }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getOutOfStockProducts() { return outOfStockProducts; }
    public void setOutOfStockProducts(long outOfStockProducts) { this.outOfStockProducts = outOfStockProducts; }

    public long getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }

    public long getActiveUsers() { return activeUsers; }
    public void setActiveUsers(long activeUsers) { this.activeUsers = activeUsers; }

    public long getTotalVendors() { return totalVendors; }
    public void setTotalVendors(long totalVendors) { this.totalVendors = totalVendors; }

    public long getPendingVendors() { return pendingVendors; }
    public void setPendingVendors(long pendingVendors) { this.pendingVendors = pendingVendors; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getCompletedOrders() { return completedOrders; }
    public void setCompletedOrders(long completedOrders) { this.completedOrders = completedOrders; }

    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }

    public long getPaidTransactions() { return paidTransactions; }
    public void setPaidTransactions(long paidTransactions) { this.paidTransactions = paidTransactions; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getTotalCommissionEarned() { return totalCommissionEarned; }
    public void setTotalCommissionEarned(double totalCommissionEarned) { this.totalCommissionEarned = totalCommissionEarned; }

    public double getTotalVendorPayouts() { return totalVendorPayouts; }
    public void setTotalVendorPayouts(double totalVendorPayouts) { this.totalVendorPayouts = totalVendorPayouts; }

    public double getAverageOrderValue() { return averageOrderValue; }
    public void setAverageOrderValue(double averageOrderValue) { this.averageOrderValue = averageOrderValue; }
}
