package com.shopstack.dto;

import jakarta.validation.constraints.NotNull;

public class ManualAllocationRequest {

    @NotNull(message = "Order Item ID is required")
    private Long orderItemId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    private String notes;

    public ManualAllocationRequest() {}

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
