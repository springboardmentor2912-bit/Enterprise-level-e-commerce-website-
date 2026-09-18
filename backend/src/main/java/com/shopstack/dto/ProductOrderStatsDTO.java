package com.shopstack.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ProductOrderStatsDTO {

    private List<TopProductDTO> topSellingProducts;
    private Map<String, Long> categoryProductCounts;
    private Map<String, BigDecimal> categorySalesRevenue;
    private long outOfStockProductsCount;
    private long lowStockProductsCount;

    public ProductOrderStatsDTO() {
    }

    public static class TopProductDTO {
        private Long productId;
        private String productName;
        private String categoryName;
        private String vendorName;
        private long totalUnitsSold;
        private BigDecimal totalRevenueGenerated;

        public TopProductDTO() {
        }

        public TopProductDTO(Long productId, String productName, String categoryName, String vendorName, long totalUnitsSold, BigDecimal totalRevenueGenerated) {
            this.productId = productId;
            this.productName = productName;
            this.categoryName = categoryName;
            this.vendorName = vendorName;
            this.totalUnitsSold = totalUnitsSold;
            this.totalRevenueGenerated = totalRevenueGenerated;
        }

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public void setCategoryName(String categoryName) {
            this.categoryName = categoryName;
        }

        public String getVendorName() {
            return vendorName;
        }

        public void setVendorName(String vendorName) {
            this.vendorName = vendorName;
        }

        public long getTotalUnitsSold() {
            return totalUnitsSold;
        }

        public void setTotalUnitsSold(long totalUnitsSold) {
            this.totalUnitsSold = totalUnitsSold;
        }

        public BigDecimal getTotalRevenueGenerated() {
            return totalRevenueGenerated;
        }

        public void setTotalRevenueGenerated(BigDecimal totalRevenueGenerated) {
            this.totalRevenueGenerated = totalRevenueGenerated;
        }
    }

    public List<TopProductDTO> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<TopProductDTO> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }

    public Map<String, Long> getCategoryProductCounts() {
        return categoryProductCounts;
    }

    public void setCategoryProductCounts(Map<String, Long> categoryProductCounts) {
        this.categoryProductCounts = categoryProductCounts;
    }

    public Map<String, BigDecimal> getCategorySalesRevenue() {
        return categorySalesRevenue;
    }

    public void setCategorySalesRevenue(Map<String, BigDecimal> categorySalesRevenue) {
        this.categorySalesRevenue = categorySalesRevenue;
    }

    public long getOutOfStockProductsCount() {
        return outOfStockProductsCount;
    }

    public void setOutOfStockProductsCount(long outOfStockProductsCount) {
        this.outOfStockProductsCount = outOfStockProductsCount;
    }

    public long getLowStockProductsCount() {
        return lowStockProductsCount;
    }

    public void setLowStockProductsCount(long lowStockProductsCount) {
        this.lowStockProductsCount = lowStockProductsCount;
    }
}
