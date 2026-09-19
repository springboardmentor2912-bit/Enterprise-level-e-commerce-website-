package com.shopstack.backend.dto;

public class AdminAnalyticsResponse {

    private long totalUsers;
    private long totalVendors;
    private long totalCustomers;
    private long totalProducts;
    private long totalOrders;

    private double totalSales;

    private long placedOrders;
    private long confirmedOrders;
    private long processingOrders;
    private long shippedOrders;
    private long outForDeliveryOrders;
    private long deliveredOrders;
    private long cancelledOrders;

    public AdminAnalyticsResponse() {
    }

    public AdminAnalyticsResponse(
            long totalUsers,
            long totalVendors,
            long totalCustomers,
            long totalProducts,
            long totalOrders,
            double totalSales,
            long placedOrders,
            long confirmedOrders,
            long processingOrders,
            long shippedOrders,
            long outForDeliveryOrders,
            long deliveredOrders,
            long cancelledOrders
    ) {
        this.totalUsers = totalUsers;
        this.totalVendors = totalVendors;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
        this.placedOrders = placedOrders;
        this.confirmedOrders = confirmedOrders;
        this.processingOrders = processingOrders;
        this.shippedOrders = shippedOrders;
        this.outForDeliveryOrders = outForDeliveryOrders;
        this.deliveredOrders = deliveredOrders;
        this.cancelledOrders = cancelledOrders;
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

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
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

    public long getPlacedOrders() {
        return placedOrders;
    }

    public void setPlacedOrders(long placedOrders) {
        this.placedOrders = placedOrders;
    }

    public long getConfirmedOrders() {
        return confirmedOrders;
    }

    public void setConfirmedOrders(long confirmedOrders) {
        this.confirmedOrders = confirmedOrders;
    }

    public long getProcessingOrders() {
        return processingOrders;
    }

    public void setProcessingOrders(long processingOrders) {
        this.processingOrders = processingOrders;
    }

    public long getShippedOrders() {
        return shippedOrders;
    }

    public void setShippedOrders(long shippedOrders) {
        this.shippedOrders = shippedOrders;
    }

    public long getOutForDeliveryOrders() {
        return outForDeliveryOrders;
    }

    public void setOutForDeliveryOrders(long outForDeliveryOrders) {
        this.outForDeliveryOrders = outForDeliveryOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public void setDeliveredOrders(long deliveredOrders) {
        this.deliveredOrders = deliveredOrders;
    }

    public long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }
}