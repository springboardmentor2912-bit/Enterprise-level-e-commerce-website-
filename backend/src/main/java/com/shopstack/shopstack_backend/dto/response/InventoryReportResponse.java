package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReportResponse {

    private Long totalProducts;

    private Long totalStockUnits;

    private Long lowStockProducts;

    private Long outOfStockProducts;
}