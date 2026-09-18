package com.shopstack.dto;

import com.shopstack.entity.StockMovementLog;
import com.shopstack.entity.StockMovementStage;

import java.time.LocalDateTime;

public class StockMovementLogDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long orderId;
    private StockMovementStage stage;
    private String previousStatus;
    private String newStatus;
    private Integer quantity;
    private String notes;
    private LocalDateTime timestamp;

    public StockMovementLogDTO() {
    }

    public StockMovementLogDTO(StockMovementLog log) {
        this.id = log.getId();
        if (log.getProduct() != null) {
            this.productId = log.getProduct().getId();
            this.productName = log.getProduct().getName();
        }
        if (log.getWarehouse() != null) {
            this.warehouseId = log.getWarehouse().getId();
            this.warehouseName = log.getWarehouse().getName();
            this.warehouseCode = log.getWarehouse().getCode();
        }
        if (log.getOrder() != null) {
            this.orderId = log.getOrder().getId();
        }
        this.stage = log.getStage();
        this.previousStatus = log.getPreviousStatus();
        this.newStatus = log.getNewStatus() != null ? log.getNewStatus() : (log.getStage() != null ? log.getStage().name() : null);
        this.quantity = log.getQuantity();
        this.notes = log.getNotes();
        this.timestamp = log.getTimestamp();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public StockMovementStage getStage() {
        return stage;
    }

    public void setStage(StockMovementStage stage) {
        this.stage = stage;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
