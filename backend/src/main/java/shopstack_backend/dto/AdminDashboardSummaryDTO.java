package shopstack_backend.dto;

import java.math.BigDecimal;

public class AdminDashboardSummaryDTO {
    private BigDecimal totalSales;
    private long totalOrders;
    private long totalVendors;
    private long totalProducts;
    private long lowStockProductsCount;
    private long completedOrders;
    private long cancelledOrders;
    private BigDecimal totalCommission;
    public AdminDashboardSummaryDTO() {}

    public AdminDashboardSummaryDTO(BigDecimal totalSales, long totalOrders, long totalVendors, long totalProducts, long lowStockProductsCount) {
        this.totalSales = totalSales;
        this.totalOrders = totalOrders;
        this.totalVendors = totalVendors;
        this.totalProducts = totalProducts;
        this.lowStockProductsCount = lowStockProductsCount;
    }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public long getTotalVendors() { return totalVendors; }
    public void setTotalVendors(long totalVendors) { this.totalVendors = totalVendors; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public long getLowStockProductsCount() { return lowStockProductsCount; }
    public void setLowStockProductsCount(long lowStockProductsCount) { this.lowStockProductsCount = lowStockProductsCount; }
}