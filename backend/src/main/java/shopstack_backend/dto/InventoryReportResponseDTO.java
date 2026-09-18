package shopstack_backend.dto;

import java.math.BigDecimal;

public class InventoryReportResponseDTO {

    private int totalProducts;
    private int totalStockUnits;
    private BigDecimal totalStockValue;
    private int outOfStockCount;
    private int lowStockCount;
    private int lowStockThreshold;

    public InventoryReportResponseDTO() {}

    public int getTotalProducts() { return totalProducts; }
    public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }

    public int getTotalStockUnits() { return totalStockUnits; }
    public void setTotalStockUnits(int totalStockUnits) { this.totalStockUnits = totalStockUnits; }

    public BigDecimal getTotalStockValue() { return totalStockValue; }
    public void setTotalStockValue(BigDecimal totalStockValue) { this.totalStockValue = totalStockValue; }

    public int getOutOfStockCount() { return outOfStockCount; }
    public void setOutOfStockCount(int outOfStockCount) { this.outOfStockCount = outOfStockCount; }

    public int getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(int lowStockCount) { this.lowStockCount = lowStockCount; }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
}