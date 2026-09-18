package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.WarehouseRequest;
import com.shopstack.shopstack_backend.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {

    WarehouseResponse createWarehouse(
            WarehouseRequest request
    );

    List<WarehouseResponse> getAllWarehouses();

    WarehouseResponse getWarehouseById(
            Long id
    );

    WarehouseResponse updateWarehouseStatus(
            Long id,
            boolean active
    );
}