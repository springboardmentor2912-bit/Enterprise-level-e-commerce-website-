package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.OrderStatus;
import java.math.BigDecimal;
import java.util.List;

public interface AdminDashboardService {

    AdminDashboardStatsDTO getDashboardStats();

    List<VendorPerformanceDTO> getVendorPerformance();

    ProductOrderStatsDTO getProductOrderStats();

    SalesReportDTO getSalesReports();

    CommissionSummaryDTO getCommissionSummary();

    VendorCommissionDTO updateVendorCommissionRate(Long vendorId, BigDecimal rate);

    VendorEarningsDTO getVendorEarnings(String vendorEmail);

    // New admin management methods
    VendorPerformanceDTO toggleVendorStatus(Long vendorId, Boolean active);

    List<ProductDTO> getAllAdminProducts();

    List<OrderDTO> getAllAdminOrders(OrderStatus statusFilter);

    AdminSystemHealthDTO getSystemHealth();

    ComprehensiveReportsDTO getComprehensiveReports();
}
