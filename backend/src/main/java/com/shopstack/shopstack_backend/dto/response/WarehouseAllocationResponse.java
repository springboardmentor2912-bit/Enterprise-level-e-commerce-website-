package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseAllocationResponse {

    private Long orderId;

    private Long warehouseId;

    private String warehouseName;

    private boolean warehouseActive;
}