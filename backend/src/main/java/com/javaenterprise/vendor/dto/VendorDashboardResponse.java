package com.javaenterprise.vendor.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VendorDashboardResponse {

    private Long totalProducts;

    private Long activeProducts;

    private Long outOfStockProducts;

    private Long pendingOrders;

    private Long completedOrders;

    private BigDecimal totalRevenue;
}