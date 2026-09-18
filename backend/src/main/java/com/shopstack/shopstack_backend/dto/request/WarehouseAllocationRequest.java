package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WarehouseAllocationRequest {

    @NotNull
    private Long warehouseId;
}