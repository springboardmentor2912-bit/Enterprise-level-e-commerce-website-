package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.VendorProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AdminServiceTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private VendorProfileRepository vendorProfileRepository;

    @Test
    @DisplayName("10.1 Admin Dashboard - System Stats Overview KPIs")
    void testGetSystemStats() {
        AdminStatsResponse stats = adminService.getSystemStats();

        assertNotNull(stats);
        assertTrue(stats.getTotalProducts() >= 0);
        assertTrue(stats.getTotalCustomers() >= 0);
        assertTrue(stats.getTotalVendors() >= 0);
        assertTrue(stats.getTotalOrders() >= 0);
        assertTrue(stats.getTotalRevenue() >= 0.0);
        assertTrue(stats.getTotalCommissionEarned() >= 0.0);
        assertTrue(stats.getTotalVendorPayouts() >= 0.0);
    }

    @Test
    @DisplayName("10.2 Admin Analytics - Sales trends, category breakdown & top performers")
    void testGetAnalytics() {
        AdminAnalyticsResponse analytics = adminService.getAnalytics("30D");

        assertNotNull(analytics);
        assertNotNull(analytics.getSalesTrend());
        assertNotNull(analytics.getCategoryBreakdown());
        assertNotNull(analytics.getOrderStatusCounts());
        assertNotNull(analytics.getTopProducts());
        assertNotNull(analytics.getTopVendors());
    }

    @Test
    @DisplayName("10.3 Admin Vendor Governance - Vendor metrics & commission rate update")
    void testVendorMetricsAndCommissionUpdate() {
        List<AdminVendorMetricResponse> vendors = adminService.getVendorsWithMetrics();
        assertNotNull(vendors);
        assertFalse(vendors.isEmpty());

        VendorProfile targetVendor = vendorProfileRepository.findAll().get(0);
        VendorProfile updated = adminService.updateVendorCommission(targetVendor.getId(), 15.0);

        assertEquals(15.0, updated.getCommissionRate());
    }

    @Test
    @DisplayName("10.4 Admin Commission Management - Summary and settlements")
    void testCommissionSummary() {
        AdminCommissionSummary summary = adminService.getCommissionSummary();
        assertNotNull(summary);
        assertTrue(summary.getTotalCommissionEarned() >= 0.0);
        assertTrue(summary.getTotalGrossSales() >= 0.0);
        assertTrue(summary.getTotalVendorPayouts() >= 0.0);
    }

    @Test
    @DisplayName("10.5 Admin Business Reports Generator - Generates Sales, Vendor, Order, Inventory reports")
    void testGenerateBusinessReports() {
        // Sales Report
        BusinessReportResponse salesReport = adminService.generateBusinessReport("SALES", "ALL");
        assertNotNull(salesReport);
        assertNotNull(salesReport.getColumns());
        assertNotNull(salesReport.getRows());

        // Vendor Performance Report
        BusinessReportResponse vendorReport = adminService.generateBusinessReport("VENDORS", "ALL");
        assertNotNull(vendorReport);
        assertNotNull(vendorReport.getColumns());

        // Order Fulfillment Report
        BusinessReportResponse orderReport = adminService.generateBusinessReport("ORDERS", "ALL");
        assertNotNull(orderReport);
        assertNotNull(orderReport.getColumns());

        // Inventory Stock Report
        BusinessReportResponse inventoryReport = adminService.generateBusinessReport("INVENTORY", "ALL");
        assertNotNull(inventoryReport);
        assertNotNull(inventoryReport.getColumns());
    }

    @Test
    @DisplayName("10.6 Admin System Health - JVM memory, threads, DB pool status")
    void testGetSystemHealth() {
        SystemHealthResponse health = adminService.getSystemHealth();
        assertNotNull(health);
        assertEquals("UP", health.getStatus());
        assertEquals("CONNECTED", health.getDatabaseStatus());
        assertTrue(health.getUptimeSeconds() >= 0);
        assertTrue(health.getHeapMemoryUsedMB() > 0);
        assertNotNull(health.getEntityCounts());
    }
}
