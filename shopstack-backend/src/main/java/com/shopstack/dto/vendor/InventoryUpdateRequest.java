package com.shopstack.dto.vendor;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryUpdateRequest {
    @NotNull
    private Integer changeQuantity; // positive to add stock, negative to remove

    private String reason; // RESTOCK, ADJUSTMENT, etc.
    private Integer lowStockThreshold;
    private String warehouseLocation;
}
