package com.shopstack.dto;

import jakarta.validation.constraints.NotNull;

public class ReturnReviewDto {

    @NotNull(message = "Approval status is required")
    private Boolean approved;

    private String adminNotes;

    private Long targetWarehouseId; // Assigned warehouse to receive returned item

    public ReturnReviewDto() {}

    public ReturnReviewDto(Boolean approved, String adminNotes, Long targetWarehouseId) {
        this.approved = approved;
        this.adminNotes = adminNotes;
        this.targetWarehouseId = targetWarehouseId;
    }

    public Boolean getApproved() { return approved; }
    public void setApproved(Boolean approved) { this.approved = approved; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public Long getTargetWarehouseId() { return targetWarehouseId; }
    public void setTargetWarehouseId(Long targetWarehouseId) { this.targetWarehouseId = targetWarehouseId; }
}
