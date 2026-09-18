package com.shopstack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class VendorStockTransferDto {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String aisleLocation;

    private String notes;

    private String transferredBy;

    public VendorStockTransferDto() {}

    public VendorStockTransferDto(Long productId, Long warehouseId, Integer quantity, String aisleLocation, String notes, String transferredBy) {
        this.productId = productId;
        this.warehouseId = warehouseId;
        this.quantity = quantity;
        this.aisleLocation = aisleLocation;
        this.notes = notes;
        this.transferredBy = transferredBy;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getTransferredBy() { return transferredBy; }
    public void setTransferredBy(String transferredBy) { this.transferredBy = transferredBy; }
}
