package com.shopstack.dto;

import java.time.LocalDateTime;

public class WarehouseInventoryDTO {
    private Long id;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseCity;
    private Long productId;
    private String productTitle;
    private String productSku;
    private String productImageUrl;
    private String productCategory;
    private Double productPrice;
    private String vendorStoreName;
    private Integer totalStock;
    private Integer allocatedStock;
    private Integer availableStock;
    private Integer damagedStock;
    private String aisleLocation;
    private Integer minThreshold;
    private Boolean isLowStock;
    private LocalDateTime lastRestockedAt;
    private LocalDateTime updatedAt;

    public WarehouseInventoryDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseCity() { return warehouseCity; }
    public void setWarehouseCity(String warehouseCity) { this.warehouseCity = warehouseCity; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public String getVendorStoreName() { return vendorStoreName; }
    public void setVendorStoreName(String vendorStoreName) { this.vendorStoreName = vendorStoreName; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }

    public Integer getAllocatedStock() { return allocatedStock; }
    public void setAllocatedStock(Integer allocatedStock) { this.allocatedStock = allocatedStock; }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public Integer getDamagedStock() { return damagedStock; }
    public void setDamagedStock(Integer damagedStock) { this.damagedStock = damagedStock; }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public Integer getMinThreshold() { return minThreshold; }
    public void setMinThreshold(Integer minThreshold) { this.minThreshold = minThreshold; }

    public Boolean getIsLowStock() { return isLowStock; }
    public void setIsLowStock(Boolean isLowStock) { this.isLowStock = isLowStock; }

    public LocalDateTime getLastRestockedAt() { return lastRestockedAt; }
    public void setLastRestockedAt(LocalDateTime lastRestockedAt) { this.lastRestockedAt = lastRestockedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
