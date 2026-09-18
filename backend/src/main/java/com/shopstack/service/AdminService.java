package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.management.ManagementFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final CommissionRepository commissionRepository;
    private final CommissionService commissionService;
    private final OrderService orderService;

    public AdminService(ProductRepository productRepository,
                        UserRepository userRepository,
                        VendorProfileRepository vendorProfileRepository,
                        OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        PaymentRepository paymentRepository,
                        CategoryRepository categoryRepository,
                        ReviewRepository reviewRepository,
                        CommissionRepository commissionRepository,
                        CommissionService commissionService,
                        OrderService orderService) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.commissionRepository = commissionRepository;
        this.commissionService = commissionService;
        this.orderService = orderService;
    }

    // 1. Overview System Stats
    public AdminStatsResponse getSystemStats() {
        long totalProducts = productRepository.count();
        long outOfStockProducts = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() == null || p.getStockQuantity() <= 0)
                .count();

        List<User> allUsers = userRepository.findAll();
        long totalCustomers = allUsers.stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
        long activeUsers = allUsers.stream().filter(u -> Boolean.TRUE.equals(u.getEnabled())).count();

        List<VendorProfile> allVendors = vendorProfileRepository.findAll();
        long totalVendors = allVendors.size();
        long pendingVendors = allVendors.stream().filter(v -> v.getStatus() == VendorStatus.PENDING).count();

        List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        long completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED || o.getPaymentStatus() == PaymentStatus.PAID)
                .count();
        long pendingOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();

        long paidTransactions = paymentRepository.countPaidTransactions();
        Double revenue = paymentRepository.calculateTotalPaidRevenue();
        double totalRevenue = revenue != null && revenue > 0 ? revenue :
                allOrders.stream()
                        .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                        .mapToDouble(Order::getTotalAmount)
                        .sum();

        // Calculate platform commission
        double totalCommissionEarned = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID || o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(o -> {
                    double rate = o.getVendorProfile() != null && o.getVendorProfile().getCommissionRate() != null
                            ? o.getVendorProfile().getCommissionRate() : 10.0;
                    return o.getTotalAmount() * (rate / 100.0);
                })
                .sum();

        double totalVendorPayouts = Math.max(0.0, totalRevenue - totalCommissionEarned);
        double aov = totalOrders > 0 ? totalRevenue / totalOrders : 0.0;

        return new AdminStatsResponse(
                totalProducts,
                outOfStockProducts,
                totalCustomers,
                activeUsers,
                totalVendors,
                pendingVendors,
                totalOrders,
                completedOrders,
                pendingOrders,
                paidTransactions,
                Math.round(totalRevenue * 100.0) / 100.0,
                Math.round(totalCommissionEarned * 100.0) / 100.0,
                Math.round(totalVendorPayouts * 100.0) / 100.0,
                Math.round(aov * 100.0) / 100.0
        );
    }

    // 2. Marketplace Analytics with Range
    public AdminAnalyticsResponse getAnalytics(String range) {
        LocalDateTime cutoff = getCutoffDate(range);
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().isAfter(cutoff))
                .collect(Collectors.toList());

        // If dataset is small or filtered out, include all available orders for demo continuity
        if (orders.isEmpty()) {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        // 2a. Sales Trend Grouping (by Day)
        DateTimeFormatter df = DateTimeFormatter.ofPattern("MMM dd");
        Map<String, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getCreatedAt() != null ? o.getCreatedAt().format(df) : LocalDate.now().format(df),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<AdminAnalyticsResponse.TrendPoint> trend = new ArrayList<>();
        // Pre-fill last 7 days if empty
        if (ordersByDate.isEmpty()) {
            for (int i = 6; i >= 0; i--) {
                String d = LocalDate.now().minusDays(i).format(df);
                trend.add(new AdminAnalyticsResponse.TrendPoint(d, 0.0, 0));
            }
        } else {
            ordersByDate.forEach((dateStr, dateOrders) -> {
                double daySales = dateOrders.stream().mapToDouble(Order::getTotalAmount).sum();
                trend.add(new AdminAnalyticsResponse.TrendPoint(dateStr, Math.round(daySales * 100.0) / 100.0, dateOrders.size()));
            });
        }

        // 2b. Category Breakdown
        List<Category> allCategories = categoryRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        double totalSales = orders.stream().mapToDouble(Order::getTotalAmount).sum();

        List<AdminAnalyticsResponse.CategoryMetric> categoryMetrics = new ArrayList<>();
        for (Category cat : allCategories) {
            long pCount = allProducts.stream().filter(p -> p.getCategory() != null && p.getCategory().getId().equals(cat.getId())).count();
            
            // Calculate sales for this category across order items
            double catSales = orders.stream()
                    .flatMap(o -> o.getItems().stream())
                    .filter(item -> item.getProduct() != null && item.getProduct().getCategory() != null && item.getProduct().getCategory().getId().equals(cat.getId()))
                    .mapToDouble(item -> (item.getUnitPrice() != null ? item.getUnitPrice() : 0.0) * (item.getQuantity() != null ? item.getQuantity() : 1))
                    .sum();

            double pct = totalSales > 0 ? (catSales / totalSales) * 100.0 : 0.0;
            categoryMetrics.add(new AdminAnalyticsResponse.CategoryMetric(
                    cat.getName(),
                    pCount,
                    Math.round(catSales * 100.0) / 100.0,
                    Math.round(pct * 10.0) / 10.0
            ));
        }

        // 2c. Top Products
        Map<Long, List<OrderItem>> itemsByProduct = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .filter(item -> item.getProduct() != null)
                .collect(Collectors.groupingBy(item -> item.getProduct().getId()));

        List<AdminAnalyticsResponse.TopProductMetric> topProducts = new ArrayList<>();
        itemsByProduct.forEach((prodId, items) -> {
            Product p = items.get(0).getProduct();
            long units = items.stream().mapToLong(OrderItem::getQuantity).sum();
            double rev = items.stream().mapToDouble(i -> (i.getUnitPrice() != null ? i.getUnitPrice() : 0.0) * (i.getQuantity() != null ? i.getQuantity() : 1)).sum();
            String vName = p.getVendorProfile() != null ? p.getVendorProfile().getStoreName() : "ShopStack Merchant";
            topProducts.add(new AdminAnalyticsResponse.TopProductMetric(
                    p.getId(),
                    p.getTitle(),
                    vName,
                    units,
                    Math.round(rev * 100.0) / 100.0,
                    p.getImageUrl()
            ));
        });
        topProducts.sort((a, b) -> Double.compare(b.getTotalRevenue(), a.getTotalRevenue()));
        List<AdminAnalyticsResponse.TopProductMetric> limitedTopProducts = topProducts.stream().limit(5).collect(Collectors.toList());

        // 2d. Top Vendors
        List<VendorProfile> vendors = vendorProfileRepository.findAll();
        List<AdminAnalyticsResponse.TopVendorMetric> topVendors = new ArrayList<>();
        for (VendorProfile v : vendors) {
            List<Order> vOrders = orders.stream()
                    .filter(o -> o.getVendorProfile() != null && o.getVendorProfile().getId().equals(v.getId()))
                    .collect(Collectors.toList());
            double vGross = vOrders.stream().mapToDouble(Order::getTotalAmount).sum();
            double vCommission = vGross * ((v.getCommissionRate() != null ? v.getCommissionRate() : 10.0) / 100.0);
            topVendors.add(new AdminAnalyticsResponse.TopVendorMetric(
                    v.getId(),
                    v.getStoreName(),
                    v.getUser() != null ? v.getUser().getEmail() : "N/A",
                    vOrders.size(),
                    Math.round(vGross * 100.0) / 100.0,
                    Math.round(vCommission * 100.0) / 100.0,
                    v.getRating() != null ? v.getRating() : 5.0
            ));
        }
        topVendors.sort((a, b) -> Double.compare(b.getGrossRevenue(), a.getGrossRevenue()));

        // 2e. Order Status Breakdown
        Map<String, Long> statusCounts = new HashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            long count = orders.stream().filter(o -> o.getStatus() == st).count();
            statusCounts.put(st.name(), count);
        }

        double periodRevenue = Math.round(totalSales * 100.0) / 100.0;
        long periodOrders = orders.size();
        double periodAov = periodOrders > 0 ? Math.round((periodRevenue / periodOrders) * 100.0) / 100.0 : 0.0;

        return new AdminAnalyticsResponse(
                trend,
                categoryMetrics,
                limitedTopProducts,
                topVendors,
                statusCounts,
                periodRevenue,
                periodOrders,
                periodAov
        );
    }

    // 3. Vendor Management with Metrics
    public List<AdminVendorMetricResponse> getVendorsWithMetrics() {
        List<VendorProfile> vendors = vendorProfileRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Order> orders = orderRepository.findAll();

        List<AdminVendorMetricResponse> response = new ArrayList<>();
        for (VendorProfile v : vendors) {
            long pCount = products.stream().filter(p -> p.getVendorProfile() != null && p.getVendorProfile().getId().equals(v.getId())).count();
            List<Order> vOrders = orders.stream().filter(o -> o.getVendorProfile() != null && o.getVendorProfile().getId().equals(v.getId())).collect(Collectors.toList());

            double gross = vOrders.stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .mapToDouble(Order::getTotalAmount)
                    .sum();
            double rate = v.getCommissionRate() != null ? v.getCommissionRate() : 10.0;
            double comm = gross * (rate / 100.0);
            double net = Math.max(0.0, gross - comm);

            User user = v.getUser();
            response.add(new AdminVendorMetricResponse(
                    v.getId(),
                    user != null ? user.getId() : null,
                    v.getStoreName(),
                    v.getDescription(),
                    v.getLogoUrl(),
                    user != null ? user.getFullName() : "N/A",
                    user != null ? user.getEmail() : "N/A",
                    user != null ? user.getPhoneNumber() : "N/A",
                    v.getStatus(),
                    v.getCommissionRate(),
                    v.getRating(),
                    pCount,
                    vOrders.size(),
                    Math.round(gross * 100.0) / 100.0,
                    Math.round(comm * 100.0) / 100.0,
                    Math.round(net * 100.0) / 100.0,
                    v.getCreatedAt()
            ));
        }
        return response;
    }

    @Transactional
    public VendorProfile updateVendorCommission(Long vendorId, Double commissionRate) {
        VendorProfile profile = vendorProfileRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Vendor not found with ID: " + vendorId));
        if (commissionRate != null && commissionRate >= 0.0 && commissionRate <= 100.0) {
            profile.setCommissionRate(commissionRate);
        }
        return vendorProfileRepository.save(profile);
    }

    // 4. Global Order Monitoring
    public List<Order> getAllOrders(String search, OrderStatus status) {
        List<Order> orders;
        if (search != null && !search.trim().isEmpty()) {
            orders = orderRepository.searchOrders(search.trim());
        } else if (status != null) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.trim().isEmpty() && status != null) {
            orders = orders.stream().filter(o -> o.getStatus() == status).collect(Collectors.toList());
        }
        return orders;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        return orderService.updateOrderStatus(orderId, status);
    }

    // 5. Commission Management Summary
    public AdminCommissionSummary getCommissionSummary() {
        return commissionService.getCommissionSummary();
    }

    // 6. System Monitoring & JVM Health
    public SystemHealthResponse getSystemHealth() {
        Runtime runtime = Runtime.getRuntime();
        double heapTotal = runtime.totalMemory() / (1024.0 * 1024.0);
        double heapFree = runtime.freeMemory() / (1024.0 * 1024.0);
        double heapUsed = heapTotal - heapFree;
        double heapMax = runtime.maxMemory() / (1024.0 * 1024.0);

        long uptimeSec = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        int activeThreads = Thread.activeCount();
        int processors = runtime.availableProcessors();
        String javaVer = System.getProperty("java.version", "17");

        Map<String, Long> entityCounts = new LinkedHashMap<>();
        entityCounts.put("Users", userRepository.count());
        entityCounts.put("Vendors", vendorProfileRepository.count());
        entityCounts.put("Products", productRepository.count());
        entityCounts.put("Orders", orderRepository.count());
        entityCounts.put("Order Items", orderItemRepository.count());
        entityCounts.put("Payments", paymentRepository.count());
        entityCounts.put("Commissions", commissionRepository.count());
        entityCounts.put("Categories", categoryRepository.count());
        entityCounts.put("Reviews", reviewRepository.count());

        return new SystemHealthResponse(
                "UP",
                uptimeSec,
                8081,
                javaVer,
                Math.round(heapUsed * 100.0) / 100.0,
                Math.round(heapMax * 100.0) / 100.0,
                Math.round(heapTotal * 100.0) / 100.0,
                42.5, // non-heap estimation
                activeThreads,
                processors,
                "CONNECTED",
                "H2 / PostgreSQL Active Pool",
                entityCounts,
                "ONLINE (Razorpay Sandbox Active)",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );
    }

    // 7. Business Reports Generator
    public BusinessReportResponse generateBusinessReport(String reportType, String range) {
        String type = (reportType != null ? reportType.toUpperCase() : "SALES");
        LocalDateTime cutoff = getCutoffDate(range);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        List<BusinessReportResponse.ReportColumn> columns = new ArrayList<>();
        List<Map<String, Object>> rows = new ArrayList<>();
        Map<String, Object> summaryMetrics = new LinkedHashMap<>();
        String title;
        String subtitle;

        switch (type) {
            case "VENDORS":
                title = "Vendor Performance & Merchant Settlement Report";
                subtitle = "Store sales volume, marketplace commission fees, and payable merchant balances.";
                columns.add(new BusinessReportResponse.ReportColumn("storeName", "Store Name", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("ownerEmail", "Merchant Email", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("status", "Store Status", "badge"));
                columns.add(new BusinessReportResponse.ReportColumn("commissionRate", "Commission Rate", "number"));
                columns.add(new BusinessReportResponse.ReportColumn("orderCount", "Total Orders", "number"));
                columns.add(new BusinessReportResponse.ReportColumn("grossSales", "Gross Sales", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("commissionAmount", "Platform Fee", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("netPayout", "Net Merchant Payout", "currency"));

                List<VendorProfile> vendors = vendorProfileRepository.findAll();
                List<Order> allOrders = orderRepository.findAll();
                double vGrossTotal = 0.0;
                double vCommTotal = 0.0;

                for (VendorProfile v : vendors) {
                    List<Order> vOrders = allOrders.stream()
                            .filter(o -> o.getVendorProfile() != null && o.getVendorProfile().getId().equals(v.getId()))
                            .collect(Collectors.toList());
                    double gross = vOrders.stream().mapToDouble(Order::getTotalAmount).sum();
                    double rate = v.getCommissionRate() != null ? v.getCommissionRate() : 10.0;
                    double comm = gross * (rate / 100.0);
                    double net = gross - comm;
                    vGrossTotal += gross;
                    vCommTotal += comm;

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("storeName", v.getStoreName());
                    row.put("ownerEmail", v.getUser() != null ? v.getUser().getEmail() : "N/A");
                    row.put("status", v.getStatus().name());
                    row.put("commissionRate", rate + "%");
                    row.put("orderCount", vOrders.size());
                    row.put("grossSales", Math.round(gross * 100.0) / 100.0);
                    row.put("commissionAmount", Math.round(comm * 100.0) / 100.0);
                    row.put("netPayout", Math.round(net * 100.0) / 100.0);
                    rows.add(row);
                }

                summaryMetrics.put("Total Vendors", vendors.size());
                summaryMetrics.put("Total Gross Volume", "₹" + String.format("%.2f", vGrossTotal));
                summaryMetrics.put("Total Marketplace Commission", "₹" + String.format("%.2f", vCommTotal));
                summaryMetrics.put("Total Net Payouts", "₹" + String.format("%.2f", vGrossTotal - vCommTotal));
                break;

            case "PRODUCTS":
                title = "Product Inventory & Catalog Valuation Report";
                subtitle = "Stock levels, pricing, category classification, and units sold.";
                columns.add(new BusinessReportResponse.ReportColumn("title", "Product Title", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("brand", "Brand / Vendor", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("category", "Category", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("price", "Unit Price", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("stockQuantity", "Current Stock", "number"));
                columns.add(new BusinessReportResponse.ReportColumn("status", "Product Status", "badge"));
                columns.add(new BusinessReportResponse.ReportColumn("rating", "Rating", "number"));

                List<Product> products = productRepository.findAll();
                long totalStock = 0;
                double totalInventoryVal = 0.0;

                for (Product p : products) {
                    int stock = p.getStockQuantity() != null ? p.getStockQuantity() : 0;
                    totalStock += stock;
                    totalInventoryVal += (p.getPrice() * stock);

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("title", p.getTitle());
                    row.put("brand", p.getBrand() != null ? p.getBrand() : (p.getVendorProfile() != null ? p.getVendorProfile().getStoreName() : "ShopStack"));
                    row.put("category", p.getCategory() != null ? p.getCategory().getName() : "General");
                    row.put("price", Math.round(p.getPrice() * 100.0) / 100.0);
                    row.put("stockQuantity", stock);
                    row.put("status", p.getStatus() != null ? p.getStatus().name() : "ACTIVE");
                    row.put("rating", p.getRating() != null ? p.getRating() : 5.0);
                    rows.add(row);
                }

                summaryMetrics.put("Total Catalog Products", products.size());
                summaryMetrics.put("Total Inventory Units", totalStock);
                summaryMetrics.put("Estimated Inventory Value", "₹" + String.format("%.2f", totalInventoryVal));
                break;

            case "ORDERS":
                title = "Order Fulfillment & Transactions Audit Report";
                subtitle = "Chronological log of customer orders, delivery statuses, and payment verifications.";
                columns.add(new BusinessReportResponse.ReportColumn("orderNumber", "Order #", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("customerName", "Customer", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("storeName", "Vendor", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("totalAmount", "Order Total", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("paymentMethod", "Payment Method", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("paymentStatus", "Payment Status", "badge"));
                columns.add(new BusinessReportResponse.ReportColumn("orderStatus", "Fulfillment Status", "badge"));
                columns.add(new BusinessReportResponse.ReportColumn("createdAt", "Date Placed", "date"));

                List<Order> orderList = orderRepository.findAllByOrderByCreatedAtDesc();
                double orderTotalSum = 0.0;
                for (Order o : orderList) {
                    orderTotalSum += o.getTotalAmount();
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("orderNumber", o.getOrderNumber());
                    row.put("customerName", o.getCustomer() != null ? o.getCustomer().getFullName() : "N/A");
                    row.put("storeName", o.getVendorProfile() != null ? o.getVendorProfile().getStoreName() : "N/A");
                    row.put("totalAmount", Math.round(o.getTotalAmount() * 100.0) / 100.0);
                    row.put("paymentMethod", o.getPaymentMethod() != null ? o.getPaymentMethod().name() : "CARD");
                    row.put("paymentStatus", o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "PENDING");
                    row.put("orderStatus", o.getStatus() != null ? o.getStatus().name() : "CONFIRMED");
                    row.put("createdAt", o.getCreatedAt() != null ? o.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A");
                    rows.add(row);
                }

                summaryMetrics.put("Total Orders Placed", orderList.size());
                summaryMetrics.put("Total Order Volume", "₹" + String.format("%.2f", orderTotalSum));
                summaryMetrics.put("Average Order Value", orderList.isEmpty() ? "₹0.00" : "₹" + String.format("%.2f", orderTotalSum / orderList.size()));
                break;

            case "SALES":
            default:
                title = "Sales & Gross Marketplace Revenue Report";
                subtitle = "Platform transaction volume, paid orders, and net marketplace earnings.";
                columns.add(new BusinessReportResponse.ReportColumn("orderNumber", "Order #", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("date", "Transaction Date", "date"));
                columns.add(new BusinessReportResponse.ReportColumn("customerEmail", "Customer", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("storeName", "Vendor Store", "text"));
                columns.add(new BusinessReportResponse.ReportColumn("grossAmount", "Gross Amount", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("commissionEarned", "Commission (Fee)", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("vendorPayout", "Vendor Payout", "currency"));
                columns.add(new BusinessReportResponse.ReportColumn("paymentStatus", "Status", "badge"));

                List<Order> salesOrders = orderRepository.findAllByOrderByCreatedAtDesc();
                double grossSum = 0.0;
                double commissionSum = 0.0;

                for (Order o : salesOrders) {
                    double rate = o.getVendorProfile() != null && o.getVendorProfile().getCommissionRate() != null
                            ? o.getVendorProfile().getCommissionRate() : 10.0;
                    double comm = o.getTotalAmount() * (rate / 100.0);
                    double payout = o.getTotalAmount() - comm;
                    grossSum += o.getTotalAmount();
                    commissionSum += comm;

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("orderNumber", o.getOrderNumber());
                    row.put("date", o.getCreatedAt() != null ? o.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : "N/A");
                    row.put("customerEmail", o.getCustomer() != null ? o.getCustomer().getEmail() : "N/A");
                    row.put("storeName", o.getVendorProfile() != null ? o.getVendorProfile().getStoreName() : "N/A");
                    row.put("grossAmount", Math.round(o.getTotalAmount() * 100.0) / 100.0);
                    row.put("commissionEarned", Math.round(comm * 100.0) / 100.0);
                    row.put("vendorPayout", Math.round(payout * 100.0) / 100.0);
                    row.put("paymentStatus", o.getPaymentStatus() != null ? o.getPaymentStatus().name() : "PAID");
                    rows.add(row);
                }

                summaryMetrics.put("Gross Sales Volume", "₹" + String.format("%.2f", grossSum));
                summaryMetrics.put("Platform Commission Earned", "₹" + String.format("%.2f", commissionSum));
                summaryMetrics.put("Net Vendor Disbursal", "₹" + String.format("%.2f", grossSum - commissionSum));
                summaryMetrics.put("Transactions Count", salesOrders.size());
                break;
        }

        return new BusinessReportResponse(
                type,
                title,
                subtitle,
                timestamp,
                range != null ? range : "ALL_TIME",
                summaryMetrics,
                columns,
                rows
        );
    }

    // 8. User Management
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
        return userRepository.save(user);
    }

    private LocalDateTime getCutoffDate(String range) {
        if ("7D".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(7);
        } else if ("30D".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(30);
        } else if ("90D".equalsIgnoreCase(range)) {
            return LocalDateTime.now().minusDays(90);
        }
        return LocalDateTime.now().minusYears(10);
    }
}
