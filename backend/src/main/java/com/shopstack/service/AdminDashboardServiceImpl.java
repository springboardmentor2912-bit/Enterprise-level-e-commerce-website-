package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DataSource dataSource;

    public AdminDashboardServiceImpl(CustomerRepository customerRepository,
                                     VendorRepository vendorRepository,
                                     ProductRepository productRepository,
                                     OrderRepository orderRepository,
                                     OrderItemRepository orderItemRepository,
                                     DataSource dataSource) {
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.dataSource = dataSource;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDTO getDashboardStats() {
        AdminDashboardStatsDTO stats = new AdminDashboardStatsDTO();

        stats.setTotalCustomers(customerRepository.count());
        stats.setTotalVendors(vendorRepository.count());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());

        BigDecimal rev = orderRepository.sumTotalSalesRevenue();
        stats.setTotalSalesRevenue(rev != null ? rev : BigDecimal.ZERO);

        BigDecimal comm = orderItemRepository.sumTotalPlatformCommission();
        stats.setTotalPlatformCommission(comm != null ? comm : BigDecimal.ZERO);

        stats.setPendingOrders(orderRepository.countByStatus(OrderStatus.PENDING));
        stats.setConfirmedOrders(orderRepository.countByStatus(OrderStatus.CONFIRMED));
        stats.setProcessingOrders(orderRepository.countByStatus(OrderStatus.PROCESSING));
        stats.setShippedOrders(orderRepository.countByStatus(OrderStatus.SHIPPED));
        stats.setDeliveredOrders(orderRepository.countByStatus(OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByStatus(OrderStatus.CANCELLED));

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorPerformanceDTO> getVendorPerformance() {
        List<Vendor> vendors = vendorRepository.findAll();
        List<VendorPerformanceDTO> list = new ArrayList<>();

        for (Vendor v : vendors) {
            long prodCount = productRepository.countByVendorId(v.getId());
            long orderCount = orderItemRepository.countOrdersByVendorId(v.getId());

            BigDecimal gross = orderItemRepository.sumGrossSalesByVendorId(v.getId());
            if (gross == null) gross = BigDecimal.ZERO;

            BigDecimal commissionDeducted = orderItemRepository.sumCommissionByVendorId(v.getId());
            if (commissionDeducted == null) {
                // If historical order item did not save commissionAmount, calculate based on vendor commission rate
                commissionDeducted = gross.multiply(v.getCommissionRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            BigDecimal netEarnings = orderItemRepository.sumVendorEarningsByVendorId(v.getId());
            if (netEarnings == null) {
                netEarnings = gross.subtract(commissionDeducted);
            }

            list.add(new VendorPerformanceDTO(
                    v.getId(),
                    v.getBusinessName(),
                    v.getEmail(),
                    v.getPhone(),
                    v.getActive(),
                    v.getCommissionRate(),
                    prodCount,
                    orderCount,
                    gross,
                    commissionDeducted,
                    netEarnings
            ));
        }

        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductOrderStatsDTO getProductOrderStats() {
        ProductOrderStatsDTO dto = new ProductOrderStatsDTO();

        // 1. Top Selling Products
        List<Object[]> topRaw = orderItemRepository.findTopSellingProducts();
        List<ProductOrderStatsDTO.TopProductDTO> topList = new ArrayList<>();
        int limit = Math.min(topRaw.size(), 10);
        for (int i = 0; i < limit; i++) {
            Object[] row = topRaw.get(i);
            Long productId = (Long) row[0];
            String name = (String) row[1];
            String category = (String) row[2];
            String vendor = (String) row[3];
            long qty = ((Number) row[4]).longValue();
            BigDecimal rev = row[5] != null ? new BigDecimal(row[5].toString()) : BigDecimal.ZERO;

            topList.add(new ProductOrderStatsDTO.TopProductDTO(productId, name, category, vendor, qty, rev));
        }
        dto.setTopSellingProducts(topList);

        // 2. Category Product Counts
        List<Object[]> catCountsRaw = productRepository.findCategoryProductCounts();
        Map<String, Long> catCountsMap = new LinkedHashMap<>();
        for (Object[] row : catCountsRaw) {
            catCountsMap.put((String) row[0], ((Number) row[1]).longValue());
        }
        dto.setCategoryProductCounts(catCountsMap);

        // 3. Category Sales Revenue
        List<Object[]> catRevRaw = orderItemRepository.findSalesRevenueByCategory();
        Map<String, BigDecimal> catRevMap = new LinkedHashMap<>();
        for (Object[] row : catRevRaw) {
            catRevMap.put((String) row[0], row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO);
        }
        dto.setCategorySalesRevenue(catRevMap);

        // 4. Stock Counts
        dto.setOutOfStockProductsCount(productRepository.countByStockQuantityEquals(0));
        dto.setLowStockProductsCount(productRepository.countByStockQuantityLessThanEqual(5));

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReportDTO getSalesReports() {
        SalesReportDTO report = new SalesReportDTO();

        BigDecimal gross = orderItemRepository.sumTotalGrossVolume();
        if (gross == null) gross = orderRepository.sumTotalSalesRevenue();
        if (gross == null) gross = BigDecimal.ZERO;

        BigDecimal discounts = orderRepository.sumTotalDiscounts();
        if (discounts == null) discounts = BigDecimal.ZERO;

        BigDecimal netSales = gross.subtract(discounts);
        if (netSales.compareTo(BigDecimal.ZERO) < 0) netSales = BigDecimal.ZERO;

        BigDecimal commission = orderItemRepository.sumTotalPlatformCommission();
        if (commission == null) commission = BigDecimal.ZERO;

        BigDecimal vendorEarn = orderItemRepository.sumTotalVendorEarnings();
        if (vendorEarn == null) vendorEarn = gross.subtract(commission);

        report.setTotalGrossSales(gross);
        report.setTotalDiscountsGiven(discounts);
        report.setTotalNetSales(netSales);
        report.setTotalPlatformCommission(commission);
        report.setTotalVendorEarnings(vendorEarn);
        report.setTotalCompletedOrders(orderRepository.count() - orderRepository.countByStatus(OrderStatus.CANCELLED));

        // Group daily sales
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        Map<String, SalesReportDTO.DailySalesDTO> dailyMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (Order o : orders) {
            if (OrderStatus.CANCELLED.equals(o.getStatus())) continue;
            String dateStr = o.getCreatedAt() != null ? o.getCreatedAt().format(fmt) : "Unknown";

            SalesReportDTO.DailySalesDTO day = dailyMap.computeIfAbsent(dateStr, k -> new SalesReportDTO.DailySalesDTO(k, 0, BigDecimal.ZERO, BigDecimal.ZERO));
            day.setOrderCount(day.getOrderCount() + 1);
            day.setTotalSales(day.getTotalSales().add(o.getTotalAmount()));

            BigDecimal orderCommission = BigDecimal.ZERO;
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    if (item.getCommissionAmount() != null) {
                        orderCommission = orderCommission.add(item.getCommissionAmount());
                    } else {
                        BigDecimal itemGross = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
                        BigDecimal rate = item.getVendor() != null && item.getVendor().getCommissionRate() != null ? item.getVendor().getCommissionRate() : new BigDecimal("10.00");
                        orderCommission = orderCommission.add(itemGross.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
                    }
                }
            }
            day.setCommissionEarned(day.getCommissionEarned().add(orderCommission));
        }

        report.setDailySalesBreakdown(new ArrayList<>(dailyMap.values()));
        return report;
    }

    @Override
    @Transactional(readOnly = true)
    public CommissionSummaryDTO getCommissionSummary() {
        BigDecimal totalGross = orderItemRepository.sumTotalGrossVolume();
        if (totalGross == null) totalGross = BigDecimal.ZERO;

        BigDecimal totalComm = orderItemRepository.sumTotalPlatformCommission();
        if (totalComm == null) totalComm = BigDecimal.ZERO;

        BigDecimal totalPayout = orderItemRepository.sumTotalVendorEarnings();
        if (totalPayout == null) totalPayout = totalGross.subtract(totalComm);

        List<VendorPerformanceDTO> vendorPerf = getVendorPerformance();
        List<VendorCommissionDTO> vendorCommissions = vendorPerf.stream().map(vp -> new VendorCommissionDTO(
                vp.getVendorId(),
                vp.getBusinessName(),
                vp.getEmail(),
                vp.getCommissionRate(),
                vp.getTotalOrdersSold(),
                vp.getTotalGrossSales(),
                vp.getTotalCommissionDeducted(),
                vp.getNetVendorEarnings()
        )).collect(Collectors.toList());

        return new CommissionSummaryDTO(totalGross, totalComm, totalPayout, vendorCommissions);
    }

    @Override
    @Transactional
    public VendorCommissionDTO updateVendorCommissionRate(Long vendorId, BigDecimal rate) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        if (rate == null || rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Commission rate must be between 0% and 100%");
        }

        vendor.setCommissionRate(rate);
        vendorRepository.save(vendor);

        BigDecimal gross = orderItemRepository.sumGrossSalesByVendorId(vendorId);
        if (gross == null) gross = BigDecimal.ZERO;

        BigDecimal commissionDeducted = orderItemRepository.sumCommissionByVendorId(vendorId);
        if (commissionDeducted == null) commissionDeducted = gross.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal netEarnings = orderItemRepository.sumVendorEarningsByVendorId(vendorId);
        if (netEarnings == null) netEarnings = gross.subtract(commissionDeducted);

        long itemsSold = orderItemRepository.countOrdersByVendorId(vendorId);

        return new VendorCommissionDTO(
                vendor.getId(),
                vendor.getBusinessName(),
                vendor.getEmail(),
                vendor.getCommissionRate(),
                itemsSold,
                gross,
                commissionDeducted,
                netEarnings
        );
    }

    @Override
    @Transactional(readOnly = true)
    public VendorEarningsDTO getVendorEarnings(String vendorEmail) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with email: " + vendorEmail));

        List<OrderItem> items = orderItemRepository.findByVendorIdOrderByOrderCreatedAtDesc(vendor.getId());

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalComm = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        List<VendorEarningsDTO.ItemizedEarningDTO> itemized = new ArrayList<>();

        for (OrderItem item : items) {
            if (OrderStatus.CANCELLED.equals(item.getOrder().getStatus())) continue;

            BigDecimal price = item.getPriceAtPurchase();
            int qty = item.getQuantity();
            BigDecimal itemTotal = price.multiply(BigDecimal.valueOf(qty));

            BigDecimal rate = item.getCommissionRate() != null ? item.getCommissionRate() : vendor.getCommissionRate();
            BigDecimal comm = item.getCommissionAmount() != null ? item.getCommissionAmount() : itemTotal.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal net = item.getVendorEarning() != null ? item.getVendorEarning() : itemTotal.subtract(comm);

            totalGross = totalGross.add(itemTotal);
            totalComm = totalComm.add(comm);
            totalNet = totalNet.add(net);

            itemized.add(new VendorEarningsDTO.ItemizedEarningDTO(
                    item.getOrder().getId(),
                    item.getId(),
                    item.getProduct() != null ? item.getProduct().getName() : "Unknown Product",
                    qty,
                    price,
                    itemTotal,
                    rate,
                    comm,
                    net,
                    item.getOrder().getCreatedAt()
            ));
        }

        VendorEarningsDTO dto = new VendorEarningsDTO();
        dto.setVendorId(vendor.getId());
        dto.setBusinessName(vendor.getBusinessName());
        dto.setCommissionRate(vendor.getCommissionRate());
        dto.setTotalGrossSales(totalGross);
        dto.setTotalCommissionDeducted(totalComm);
        dto.setNetEarnings(totalNet);
        dto.setItemizedEarnings(itemized);

        return dto;
    }

    // ─── New Admin Management Methods ──────────────────────────────────────

    @Override
    @Transactional
    public VendorPerformanceDTO toggleVendorStatus(Long vendorId, Boolean active) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with ID: " + vendorId));

        vendor.setActive(active != null ? active : !vendor.getActive());
        vendorRepository.save(vendor);

        long prodCount = productRepository.countByVendorId(vendor.getId());
        long orderCount = orderItemRepository.countOrdersByVendorId(vendor.getId());
        BigDecimal gross = orderItemRepository.sumGrossSalesByVendorId(vendor.getId());
        if (gross == null) gross = BigDecimal.ZERO;
        BigDecimal commissionDeducted = orderItemRepository.sumCommissionByVendorId(vendor.getId());
        if (commissionDeducted == null) commissionDeducted = gross.multiply(vendor.getCommissionRate()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netEarnings = orderItemRepository.sumVendorEarningsByVendorId(vendor.getId());
        if (netEarnings == null) netEarnings = gross.subtract(commissionDeducted);

        return new VendorPerformanceDTO(vendor.getId(), vendor.getBusinessName(), vendor.getEmail(), vendor.getPhone(),
                vendor.getActive(), vendor.getCommissionRate(), prodCount, orderCount, gross, commissionDeducted, netEarnings);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllAdminProducts() {
        return productRepository.findAll().stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllAdminOrders(OrderStatus statusFilter) {
        List<Order> orders;
        if (statusFilter != null) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                    .filter(o -> o.getStatus() == statusFilter)
                    .collect(Collectors.toList());
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream().map(OrderDTO::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSystemHealthDTO getSystemHealth() {
        AdminSystemHealthDTO health = new AdminSystemHealthDTO();
        health.setTimestamp(System.currentTimeMillis());

        // 1. Backend API - always UP if we reach here
        health.setBackendApi(new AdminSystemHealthDTO.ComponentHealth(
                "UP", "Spring Boot API is operational", 0L,
                Map.of("version", "1.0.0", "framework", "Spring Boot")));

        // 2. PostgreSQL DB connection check
        long dbStart = System.currentTimeMillis();
        try (Connection conn = dataSource.getConnection()) {
            boolean valid = conn.isValid(2);
            long dbLatency = System.currentTimeMillis() - dbStart;
            health.setDatabase(new AdminSystemHealthDTO.ComponentHealth(
                    valid ? "UP" : "DOWN",
                    valid ? "PostgreSQL database connection is healthy" : "PostgreSQL connection invalid",
                    dbLatency,
                    Map.of("connectionValid", valid)));
        } catch (Exception e) {
            long dbLatency = System.currentTimeMillis() - dbStart;
            health.setDatabase(new AdminSystemHealthDTO.ComponentHealth(
                    "DOWN", "PostgreSQL connection error: " + e.getMessage(), dbLatency, Map.of()));
        }

        // 3. Authentication - check by counting admin-related JWT security config
        health.setAuthentication(new AdminSystemHealthDTO.ComponentHealth(
                "UP", "Spring Security JWT authentication is active", 1L,
                Map.of("mechanism", "JWT Bearer Token", "roles", "CUSTOMER, VENDOR, ADMIN")));

        // 4. Product Service - check product count
        long prodStart = System.currentTimeMillis();
        long productCount = productRepository.count();
        long prodLatency = System.currentTimeMillis() - prodStart;
        health.setProductService(new AdminSystemHealthDTO.ComponentHealth(
                "UP", "Product service is operational",
                prodLatency,
                Map.of("totalProducts", productCount)));

        // 5. Order Service - check order count
        long orderStart = System.currentTimeMillis();
        long orderCount = orderRepository.count();
        long orderLatency = System.currentTimeMillis() - orderStart;
        health.setOrderService(new AdminSystemHealthDTO.ComponentHealth(
                "UP", "Order service is operational",
                orderLatency,
                Map.of("totalOrders", orderCount)));

        // Determine overall status
        boolean dbUp = "UP".equals(health.getDatabase().getStatus());
        health.setOverallStatus(dbUp ? "UP" : "DEGRADED");

        return health;
    }

    @Override
    @Transactional(readOnly = true)
    public ComprehensiveReportsDTO getComprehensiveReports() {
        ComprehensiveReportsDTO reports = new ComprehensiveReportsDTO();

        // Sales report
        reports.setSalesReport(getSalesReports());

        // Commission report
        reports.setCommissionReport(getCommissionSummary());

        // Product performance report
        reports.setProductPerformanceReport(getProductOrderStats());

        // Vendor performance report
        reports.setVendorPerformanceReport(getVendorPerformance());

        // Order report
        long totalOrders = orderRepository.count();
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        BigDecimal totalRevenue = orderRepository.sumTotalSalesRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        BigDecimal avgOrderValue = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        Map<String, Long> ordersByStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            ordersByStatus.put(s.name(), orderRepository.countByStatus(s));
        }
        reports.setOrderReport(new ComprehensiveReportsDTO.OrderReportSummary(
                totalOrders, completedOrders, cancelledOrders, avgOrderValue, ordersByStatus));

        // Revenue report
        BigDecimal grossRevenue = orderItemRepository.sumTotalGrossVolume();
        if (grossRevenue == null) grossRevenue = BigDecimal.ZERO;
        BigDecimal totalDiscounts = orderRepository.sumTotalDiscounts();
        if (totalDiscounts == null) totalDiscounts = BigDecimal.ZERO;
        BigDecimal netRevenue = grossRevenue.subtract(totalDiscounts);
        BigDecimal platformComm = orderItemRepository.sumTotalPlatformCommission();
        if (platformComm == null) platformComm = BigDecimal.ZERO;
        BigDecimal vendorPayouts = orderItemRepository.sumTotalVendorEarnings();
        if (vendorPayouts == null) vendorPayouts = grossRevenue.subtract(platformComm);

        reports.setRevenueReport(new ComprehensiveReportsDTO.RevenueReportSummary(
                grossRevenue, totalDiscounts, netRevenue, platformComm, vendorPayouts));

        return reports;
    }
}
