package com.shopstack.dto;

public class WarehouseAnalyticsDTO {
    private long totalWarehouses;
    private long activeWarehouses;
    private long totalAvailableStock;
    private long totalAllocatedStock;
    private long pendingAllocationsCount;
    private long pickedAllocationsCount;
    private long packedAllocationsCount;
    private long readyForShipmentCount;

    public WarehouseAnalyticsDTO() {
    }

    public long getTotalWarehouses() {
        return totalWarehouses;
    }

    public void setTotalWarehouses(long totalWarehouses) {
        this.totalWarehouses = totalWarehouses;
    }

    public long getActiveWarehouses() {
        return activeWarehouses;
    }

    public void setActiveWarehouses(long activeWarehouses) {
        this.activeWarehouses = activeWarehouses;
    }

    public long getTotalAvailableStock() {
        return totalAvailableStock;
    }

    public void setTotalAvailableStock(long totalAvailableStock) {
        this.totalAvailableStock = totalAvailableStock;
    }

    public long getTotalAllocatedStock() {
        return totalAllocatedStock;
    }

    public void setTotalAllocatedStock(long totalAllocatedStock) {
        this.totalAllocatedStock = totalAllocatedStock;
    }

    public long getPendingAllocationsCount() {
        return pendingAllocationsCount;
    }

    public void setPendingAllocationsCount(long pendingAllocationsCount) {
        this.pendingAllocationsCount = pendingAllocationsCount;
    }

    public long getPickedAllocationsCount() {
        return pickedAllocationsCount;
    }

    public void setPickedAllocationsCount(long pickedAllocationsCount) {
        this.pickedAllocationsCount = pickedAllocationsCount;
    }

    public long getPackedAllocationsCount() {
        return packedAllocationsCount;
    }

    public void setPackedAllocationsCount(long packedAllocationsCount) {
        this.packedAllocationsCount = packedAllocationsCount;
    }

    public long getReadyForShipmentCount() {
        return readyForShipmentCount;
    }

    public void setReadyForShipmentCount(long readyForShipmentCount) {
        this.readyForShipmentCount = readyForShipmentCount;
    }
}
