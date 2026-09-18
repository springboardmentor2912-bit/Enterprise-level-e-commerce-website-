package com.shopstack.dto;

import jakarta.validation.constraints.NotNull;

public class AdminReceiveReturnRequest {

    /** True = product is usable and should be restocked; False = damaged, do not restock */
    @NotNull(message = "isUsable flag is required")
    private Boolean isUsable;

    /** The warehouse ID to restock into (required when isUsable = true) */
    private Long warehouseId;

    private String adminNotes;

    public AdminReceiveReturnRequest() {}

    public Boolean getIsUsable() { return isUsable; }
    public void setIsUsable(Boolean isUsable) { this.isUsable = isUsable; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}
