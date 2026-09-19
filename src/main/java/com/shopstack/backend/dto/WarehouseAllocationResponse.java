package com.shopstack.backend.dto;

import com.shopstack.backend.enums.WarehouseAllocationStatus;
import java.time.LocalDateTime;
import java.util.List;

public record WarehouseAllocationResponse(Long id, Long orderId, Long warehouseId, String warehouseName, Long staffId, String staffName, WarehouseAllocationStatus status, LocalDateTime allocatedAt, List<Item> items) {
    public record Item(Long productId, String productName, Integer quantity, Integer pickedQuantity) {}
}
