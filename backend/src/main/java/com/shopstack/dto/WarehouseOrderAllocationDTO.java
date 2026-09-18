package com.shopstack.dto;

import com.shopstack.entity.WarehouseAllocationStatus;
import com.shopstack.entity.WarehouseOrderAllocation;

import java.time.LocalDateTime;

public class WarehouseOrderAllocationDTO {
    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long productId;
    private String productName;
    private Integer allocatedQuantity;
    private WarehouseAllocationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WarehouseOrderAllocationDTO() {
    }

    public WarehouseOrderAllocationDTO(WarehouseOrderAllocation woa) {
        this.id = woa.getId();
        if (woa.getOrder() != null) {
            this.orderId = woa.getOrder().getId();
        }
        if (woa.getOrderItem() != null) {
            this.orderItemId = woa.getOrderItem().getId();
        }
        if (woa.getWarehouse() != null) {
            this.warehouseId = woa.getWarehouse().getId();
            this.warehouseName = woa.getWarehouse().getName();
            this.warehouseCode = woa.getWarehouse().getCode();
        }
        if (woa.getProduct() != null) {
            this.productId = woa.getProduct().getId();
            this.productName = woa.getProduct().getName();
        }
        this.allocatedQuantity = woa.getAllocatedQuantity();
        this.status = woa.getStatus();
        this.createdAt = woa.getCreatedAt();
        this.updatedAt = woa.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Long orderItemId) {
        this.orderItemId = orderItemId;
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

    public Integer getAllocatedQuantity() {
        return allocatedQuantity;
    }

    public void setAllocatedQuantity(Integer allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }

    public WarehouseAllocationStatus getStatus() {
        return status;
    }

    public void setStatus(WarehouseAllocationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
