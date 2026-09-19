package com.shopstack.backend.dto;

public record WarehouseAnalyticsResponse(long warehouses, long activeWarehouses, long allocatedOrders, long pickingOrders, long packedOrders, long readyForShippingOrders, long stockMovements) {}
