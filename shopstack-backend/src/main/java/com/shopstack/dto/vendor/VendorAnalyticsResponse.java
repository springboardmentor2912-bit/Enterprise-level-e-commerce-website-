package com.shopstack.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAnalyticsResponse {
    private long totalProducts;
    private long approvedProducts;
    private long pendingProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long lowStockProductCount;
}
