package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.WarehouseAllocationRequest;
import com.shopstack.shopstack_backend.dto.response.WarehouseAllocationResponse;

public interface WarehouseAllocationService {

    WarehouseAllocationResponse allocateOrderToWarehouse(
            Long orderId,
            WarehouseAllocationRequest request
    );
}