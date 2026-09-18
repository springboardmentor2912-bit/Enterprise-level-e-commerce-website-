package com.shopstack.dto;

public class AllocateOrderRequest {
    private Long orderId;
    private Long warehouseId;

    public AllocateOrderRequest() {
    }

    public AllocateOrderRequest(Long orderId, Long warehouseId) {
        this.orderId = orderId;
        this.warehouseId = warehouseId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }
}
