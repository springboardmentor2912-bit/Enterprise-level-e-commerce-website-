package com.shopstack.backend.dto;

public record WarehouseInventoryResponse(Long id, Long warehouseId, String warehouseName, Long productId, String productName, Integer quantity, Integer reservedQuantity, Integer availableQuantity) {}
