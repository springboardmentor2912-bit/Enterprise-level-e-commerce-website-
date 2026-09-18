package com.shopstack.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketplaceAnalytics {
    private long totalUsers;
    private long totalCustomers;
    private long totalVendors;
    private long approvedVendors;
    private long pendingVendors;
    private long totalProducts;
    private long approvedProducts;
    private long totalOrders;
    private long confirmedOrders;
    private long cancelledOrders;
    private BigDecimal totalGrossRevenue;
    private BigDecimal totalCommissionEarned;
    private long pendingReturns;
    private long openWarehouseTasks;
}
