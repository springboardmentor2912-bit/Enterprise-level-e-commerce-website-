package com.shopstack.dto;

import com.shopstack.model.StockMovementStage;
import com.shopstack.model.StockMovementType;
import java.time.LocalDateTime;

public class StockMovementDTO {
    private Long id;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private Long productId;
    private String productTitle;
    private String productSku;
    private String productImageUrl;
    private Long orderId;
    private String orderNumber;
    private StockMovementType movementType;
    private StockMovementStage stage;
    private Integer quantity;
    private Integer previousAvailableStock;
    private Integer newAvailableStock;
    private Integer previousAllocatedStock;
    private Integer newAllocatedStock;
    private Integer previousTotalStock;
    private Integer newTotalStock;
    private String referenceNumber;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;

    public StockMovementDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public StockMovementType getMovementType() { return movementType; }
    public void setMovementType(StockMovementType movementType) { this.movementType = movementType; }

    public StockMovementStage getStage() { return stage; }
    public void setStage(StockMovementStage stage) { this.stage = stage; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousAvailableStock() { return previousAvailableStock; }
    public void setPreviousAvailableStock(Integer previousAvailableStock) { this.previousAvailableStock = previousAvailableStock; }

    public Integer getNewAvailableStock() { return newAvailableStock; }
    public void setNewAvailableStock(Integer newAvailableStock) { this.newAvailableStock = newAvailableStock; }

    public Integer getPreviousAllocatedStock() { return previousAllocatedStock; }
    public void setPreviousAllocatedStock(Integer previousAllocatedStock) { this.previousAllocatedStock = previousAllocatedStock; }

    public Integer getNewAllocatedStock() { return newAllocatedStock; }
    public void setNewAllocatedStock(Integer newAllocatedStock) { this.newAllocatedStock = newAllocatedStock; }

    public Integer getPreviousTotalStock() { return previousTotalStock; }
    public void setPreviousTotalStock(Integer previousTotalStock) { this.previousTotalStock = previousTotalStock; }

    public Integer getNewTotalStock() { return newTotalStock; }
    public void setNewTotalStock(Integer newTotalStock) { this.newTotalStock = newTotalStock; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
