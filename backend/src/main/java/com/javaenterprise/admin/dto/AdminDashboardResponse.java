package com.javaenterprise.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalCustomers;

    private long totalVendors;

    private long totalWarehouseStaff;

    private long totalProducts;

    private long pendingProducts;

    private long approvedProducts;

    private long rejectedProducts;

    private long totalOrders;

    private long pendingOrders;

    private long completedOrders;

    private BigDecimal totalRevenue;
}