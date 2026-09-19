package com.shopstack.backend.dto;

import com.shopstack.backend.enums.StockMovementType;
import java.time.LocalDateTime;

public record StockMovementResponse(Long id, Long warehouseId, Long productId, String productName, Long orderId, Long staffId, StockMovementType type, Integer quantity, LocalDateTime createdAt) {}
