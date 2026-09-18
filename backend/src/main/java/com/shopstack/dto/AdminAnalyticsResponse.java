package com.shopstack.dto;

import java.util.List;
import java.util.Map;

public class AdminAnalyticsResponse {

    private List<TrendPoint> salesTrend;
    private List<CategoryMetric> categoryBreakdown;
    private List<TopProductMetric> topProducts;
    private List<TopVendorMetric> topVendors;
    private Map<String, Long> orderStatusCounts;
    private double periodRevenue;
    private long periodOrders;
    private double periodAverageOrderValue;

    public AdminAnalyticsResponse() {}

    public AdminAnalyticsResponse(List<TrendPoint> salesTrend, List<CategoryMetric> categoryBreakdown,
                                  List<TopProductMetric> topProducts, List<TopVendorMetric> topVendors,
                                  Map<String, Long> orderStatusCounts, double periodRevenue,
                                  long periodOrders, double periodAverageOrderValue) {
        this.salesTrend = salesTrend;
        this.categoryBreakdown = categoryBreakdown;
        this.topProducts = topProducts;
        this.topVendors = topVendors;
        this.orderStatusCounts = orderStatusCounts;
        this.periodRevenue = periodRevenue;
        this.periodOrders = periodOrders;
        this.periodAverageOrderValue = periodAverageOrderValue;
    }

    public List<TrendPoint> getSalesTrend() { return salesTrend; }
    public void setSalesTrend(List<TrendPoint> salesTrend) { this.salesTrend = salesTrend; }

    public List<CategoryMetric> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(List<CategoryMetric> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<TopProductMetric> getTopProducts() { return topProducts; }
    public void setTopProducts(List<TopProductMetric> topProducts) { this.topProducts = topProducts; }

    public List<TopVendorMetric> getTopVendors() { return topVendors; }
    public void setTopVendors(List<TopVendorMetric> topVendors) { this.topVendors = topVendors; }

    public Map<String, Long> getOrderStatusCounts() { return orderStatusCounts; }
    public void setOrderStatusCounts(Map<String, Long> orderStatusCounts) { this.orderStatusCounts = orderStatusCounts; }

    public double getPeriodRevenue() { return periodRevenue; }
    public void setPeriodRevenue(double periodRevenue) { this.periodRevenue = periodRevenue; }

    public long getPeriodOrders() { return periodOrders; }
    public void setPeriodOrders(long periodOrders) { this.periodOrders = periodOrders; }

    public double getPeriodAverageOrderValue() { return periodAverageOrderValue; }
    public void setPeriodAverageOrderValue(double periodAverageOrderValue) { this.periodAverageOrderValue = periodAverageOrderValue; }

    public static class TrendPoint {
        private String date;
        private double sales;
        private long orders;

        public TrendPoint() {}
        public TrendPoint(String date, double sales, long orders) {
            this.date = date;
            this.sales = sales;
            this.orders = orders;
        }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public double getSales() { return sales; }
        public void setSales(double sales) { this.sales = sales; }
        public long getOrders() { return orders; }
        public void setOrders(long orders) { this.orders = orders; }
    }

    public static class CategoryMetric {
        private String categoryName;
        private long productCount;
        private double revenue;
        private double percentage;

        public CategoryMetric() {}
        public CategoryMetric(String categoryName, long productCount, double revenue, double percentage) {
            this.categoryName = categoryName;
            this.productCount = productCount;
            this.revenue = revenue;
            this.percentage = percentage;
        }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
        public long getProductCount() { return productCount; }
        public void setProductCount(long productCount) { this.productCount = productCount; }
        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
    }

    public static class TopProductMetric {
        private Long productId;
        private String title;
        private String vendorName;
        private long unitsSold;
        private double totalRevenue;
        private String imageUrl;

        public TopProductMetric() {}
        public TopProductMetric(Long productId, String title, String vendorName, long unitsSold, double totalRevenue, String imageUrl) {
            this.productId = productId;
            this.title = title;
            this.vendorName = vendorName;
            this.unitsSold = unitsSold;
            this.totalRevenue = totalRevenue;
            this.imageUrl = imageUrl;
        }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getVendorName() { return vendorName; }
        public void setVendorName(String vendorName) { this.vendorName = vendorName; }
        public long getUnitsSold() { return unitsSold; }
        public void setUnitsSold(long unitsSold) { this.unitsSold = unitsSold; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class TopVendorMetric {
        private Long vendorId;
        private String storeName;
        private String ownerEmail;
        private long orderCount;
        private double grossRevenue;
        private double commissionEarned;
        private double rating;

        public TopVendorMetric() {}
        public TopVendorMetric(Long vendorId, String storeName, String ownerEmail, long orderCount, double grossRevenue, double commissionEarned, double rating) {
            this.vendorId = vendorId;
            this.storeName = storeName;
            this.ownerEmail = ownerEmail;
            this.orderCount = orderCount;
            this.grossRevenue = grossRevenue;
            this.commissionEarned = commissionEarned;
            this.rating = rating;
        }
        public Long getVendorId() { return vendorId; }
        public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
        public String getStoreName() { return storeName; }
        public void setStoreName(String storeName) { this.storeName = storeName; }
        public String getOwnerEmail() { return ownerEmail; }
        public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }
        public long getOrderCount() { return orderCount; }
        public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
        public double getGrossRevenue() { return grossRevenue; }
        public void setGrossRevenue(double grossRevenue) { this.grossRevenue = grossRevenue; }
        public double getCommissionEarned() { return commissionEarned; }
        public void setCommissionEarned(double commissionEarned) { this.commissionEarned = commissionEarned; }
        public double getRating() { return rating; }
        public void setRating(double rating) { this.rating = rating; }
    }
}
