package com.shopstack.dto;

import com.shopstack.entity.WarehouseInventory;

import java.time.LocalDateTime;

public class WarehouseInventoryDTO {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long productId;
    private String productName;
    private Integer availableQuantity;
    private Integer allocatedQuantity;
    private Integer damagedQuantity;
    private LocalDateTime updatedAt;

    public WarehouseInventoryDTO() {
    }

    public WarehouseInventoryDTO(WarehouseInventory wi) {
        this.id = wi.getId();
        if (wi.getWarehouse() != null) {
            this.warehouseId = wi.getWarehouse().getId();
            this.warehouseName = wi.getWarehouse().getName();
            this.warehouseCode = wi.getWarehouse().getCode();
        }
        if (wi.getProduct() != null) {
            this.productId = wi.getProduct().getId();
            this.productName = wi.getProduct().getName();
        }
        this.availableQuantity = wi.getAvailableQuantity();
        this.allocatedQuantity = wi.getAllocatedQuantity();
        this.damagedQuantity = wi.getDamagedQuantity();
        this.updatedAt = wi.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }

    public String getWarehouseCode() {
        return warehouseCode;
    }

    public void setWarehouseCode(String warehouseCode) {
        this.warehouseCode = warehouseCode;
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

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Integer getAllocatedQuantity() {
        return allocatedQuantity;
    }

    public void setAllocatedQuantity(Integer allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }

    public Integer getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(Integer damagedQuantity) {
        this.damagedQuantity = damagedQuantity;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
