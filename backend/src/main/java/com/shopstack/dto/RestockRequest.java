package com.shopstack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RestockRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Restock quantity must be at least 1")
    private Integer quantity;

    private String aisleLocation;
    private String notes;
    private String performedBy = "Warehouse Manager";

    public RestockRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
