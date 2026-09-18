package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;

    private long totalCustomers;

    private long totalVendors;

    private long approvedVendors;

    private long totalProducts;

    private long totalOrders;

    private double totalSales;

    private long placedOrders;

    private long confirmedOrders;

    private long shippedOrders;

    private long deliveredOrders;

    private long cancelledOrders;

    private long returnedOrders;

    private long refundedOrders;
}