package com.shopstack.dto;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WarehouseAnalyticsDTO {
    private Long totalWarehouses = 0L;
    private Long totalStorageCapacity = 0L;
    private Long totalStoredStock = 0L;
    private Long totalAllocatedStock = 0L;
    private Long totalAvailableStock = 0L;
    private Double overallUtilizationPercentage = 0.0;

    private Long allocatedCount = 0L;
    private Long pickedCount = 0L;
    private Long packedCount = 0L;
    private Long readyForShipmentCount = 0L;
    private Long shippedCount = 0L;
    private Long lowStockItemCount = 0L;
    private Long totalStockMovements = 0L;
    private Long totalDamagedStock = 0L;
    private Long pendingReturnsCount = 0L;
    private Long completedReturnsCount = 0L;

    private Map<String, Long> pipelineStageCounts = new HashMap<>();
    private List<WarehouseDTO> warehouseSummaries;

    public WarehouseAnalyticsDTO() {}

    // Getters and Setters
    public Long getTotalWarehouses() { return totalWarehouses; }
    public void setTotalWarehouses(Long totalWarehouses) { this.totalWarehouses = totalWarehouses; }

    public Long getTotalStorageCapacity() { return totalStorageCapacity; }
    public void setTotalStorageCapacity(Long totalStorageCapacity) { this.totalStorageCapacity = totalStorageCapacity; }

    public Long getTotalStoredStock() { return totalStoredStock; }
    public void setTotalStoredStock(Long totalStoredStock) { this.totalStoredStock = totalStoredStock; }

    public Long getTotalAllocatedStock() { return totalAllocatedStock; }
    public void setTotalAllocatedStock(Long totalAllocatedStock) { this.totalAllocatedStock = totalAllocatedStock; }

    public Long getTotalAvailableStock() { return totalAvailableStock; }
    public void setTotalAvailableStock(Long totalAvailableStock) { this.totalAvailableStock = totalAvailableStock; }

    public Double getOverallUtilizationPercentage() { return overallUtilizationPercentage; }
    public void setOverallUtilizationPercentage(Double overallUtilizationPercentage) { this.overallUtilizationPercentage = overallUtilizationPercentage; }

    public Long getAllocatedCount() { return allocatedCount; }
    public void setAllocatedCount(Long allocatedCount) { this.allocatedCount = allocatedCount; }

    public Long getPickedCount() { return pickedCount; }
    public void setPickedCount(Long pickedCount) { this.pickedCount = pickedCount; }

    public Long getPackedCount() { return packedCount; }
    public void setPackedCount(Long packedCount) { this.packedCount = packedCount; }

    public Long getReadyForShipmentCount() { return readyForShipmentCount; }
    public void setReadyForShipmentCount(Long readyForShipmentCount) { this.readyForShipmentCount = readyForShipmentCount; }

    public Long getShippedCount() { return shippedCount; }
    public void setShippedCount(Long shippedCount) { this.shippedCount = shippedCount; }

    public Long getLowStockItemCount() { return lowStockItemCount; }
    public void setLowStockItemCount(Long lowStockItemCount) { this.lowStockItemCount = lowStockItemCount; }

    public Long getTotalStockMovements() { return totalStockMovements; }
    public void setTotalStockMovements(Long totalStockMovements) { this.totalStockMovements = totalStockMovements; }

    public Long getTotalDamagedStock() { return totalDamagedStock; }
    public void setTotalDamagedStock(Long totalDamagedStock) { this.totalDamagedStock = totalDamagedStock; }

    public Long getPendingReturnsCount() { return pendingReturnsCount; }
    public void setPendingReturnsCount(Long pendingReturnsCount) { this.pendingReturnsCount = pendingReturnsCount; }

    public Long getCompletedReturnsCount() { return completedReturnsCount; }
    public void setCompletedReturnsCount(Long completedReturnsCount) { this.completedReturnsCount = completedReturnsCount; }

    public Map<String, Long> getPipelineStageCounts() { return pipelineStageCounts; }
    public void setPipelineStageCounts(Map<String, Long> pipelineStageCounts) { this.pipelineStageCounts = pipelineStageCounts; }

    public List<WarehouseDTO> getWarehouseSummaries() { return warehouseSummaries; }
    public void setWarehouseSummaries(List<WarehouseDTO> warehouseSummaries) { this.warehouseSummaries = warehouseSummaries; }
}
