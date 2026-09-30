package com.shopstack.backend.controller;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.razorpay.RazorpayException;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.RefundRepository;
import com.shopstack.backend.service.PaymentService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AdminController {

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private com.shopstack.backend.repository.ReviewRepository reviewRepository;

    @Autowired
    private com.shopstack.backend.repository.InventoryRepository inventoryRepository;

    @Autowired
    private com.shopstack.backend.service.FileStorageService fileStorageService;

    @Autowired
    private com.shopstack.backend.repository.WishlistItemRepository wishlistItemRepository;

    @Autowired
    private com.shopstack.backend.repository.ProductCouponRepository productCouponRepository;

    @Autowired
    private com.shopstack.backend.repository.InboundShipmentRepository inboundShipmentRepository;

    @Autowired
    private com.shopstack.backend.repository.StockTransferRepository stockTransferRepository;

    @Autowired
    private com.shopstack.backend.repository.WarehouseAllocationRepository warehouseAllocationRepository;

    @Autowired
    private com.shopstack.backend.repository.OrderItemRepository orderItemRepository;

    /**
     * Get all vendor settlements across the platform
     */
    @GetMapping("/settlements")
    public ResponseEntity<?> getAllSettlements() {
        try {
            List<Settlement> settlements = settlementRepository.findAllByOrderByIdDesc();
            List<Order> orders = orderRepository.findAll();
            Map<String, Order> orderMap = orders.stream()
                    .filter(o -> o.getOrderId() != null)
                    .collect(Collectors.toMap(Order::getOrderId, o -> o, (a, b) -> a));

            double totalGross = 0;
            double totalCommission = 0;
            double totalNetPayout = 0;
            double pendingPayout = 0;
            double settledPayout = 0;

            for (Settlement s : settlements) {
                Order matchedOrder = orderMap.get(s.getOrderId());
                String ordSt = (matchedOrder != null && matchedOrder.getStatus() != null) ? matchedOrder.getStatus().toUpperCase() : "";

                // Auto-populate missing createdAt from order date
                if ((s.getCreatedAt() == null || s.getCreatedAt().trim().isEmpty()) && matchedOrder != null && matchedOrder.getDate() != null) {
                    s.setCreatedAt(matchedOrder.getDate());
                    try { settlementRepository.save(s); } catch (Exception ignored) {}
                }

                // Auto-populate missing settledAt for SETTLED status
                if ("SETTLED".equalsIgnoreCase(s.getStatus()) && (s.getSettledAt() == null || s.getSettledAt().trim().isEmpty())) {
                    s.setSettledAt(s.getCreatedAt() != null ? s.getCreatedAt() : new SimpleDateFormat("MMM dd, yyyy").format(new Date()));
                    try { settlementRepository.save(s); } catch (Exception ignored) {}
                }
                
                // If order is refunded or cancelled, sync settlement status to REFUNDED / CANCELLED and zero out net payout
                if ("REFUNDED".equalsIgnoreCase(ordSt) || "CANCELLED".equalsIgnoreCase(ordSt)) {
                    if (!"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                        if (!"SETTLED".equalsIgnoreCase(s.getStatus())) {
                            s.setStatus("REFUNDED".equalsIgnoreCase(ordSt) ? "REFUNDED" : "CANCELLED");
                            s.setNetPayoutAmount(0.0);
                            try { settlementRepository.save(s); } catch (Exception ignored) {}
                        }
                    }
                }

                // 1. Gross Volume includes all non-void order sales
                if (!"VOID".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                    totalGross += Math.abs(s.getGrossAmount());
                }

                // 2. Refunded orders contribute 0 to Platform Revenue, Pending Payouts, and Settled Payouts
                if (!"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus()) && !"VOID".equalsIgnoreCase(s.getStatus()) && !"REFUNDED".equalsIgnoreCase(ordSt) && !"CANCELLED".equalsIgnoreCase(ordSt)) {
                    totalCommission += s.getCommissionAmount();
                    totalNetPayout += s.getNetPayoutAmount();
                    if ("SETTLED".equalsIgnoreCase(s.getStatus())) {
                        settledPayout += s.getNetPayoutAmount();
                    } else if ("PENDING".equalsIgnoreCase(s.getStatus())) {
                        pendingPayout += s.getNetPayoutAmount();
                    }
                }
            }

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalGross", Math.round(totalGross * 100.0) / 100.0);
            summary.put("totalCommission", Math.round(totalCommission * 100.0) / 100.0);
            summary.put("totalNetPayout", Math.round(totalNetPayout * 100.0) / 100.0);
            summary.put("pendingPayout", Math.round(pendingPayout * 100.0) / 100.0);
            summary.put("settledPayout", Math.round(settledPayout * 100.0) / 100.0);
            summary.put("totalSettlementRecords", settlements.size());

            Map<String, Object> response = new HashMap<>();
            response.put("summary", summary);
            response.put("settlements", settlements);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve settlements: " + e.getMessage());
        }
    }

    /**
     * Mark a vendor payout/settlement as SETTLED
     */
    @PutMapping("/settlements/{settlementId}/mark-settled")
    public ResponseEntity<?> markSettlementAsSettled(@PathVariable Long settlementId) {
        try {
            Optional<Settlement> settlementOpt = settlementRepository.findById(settlementId);
            if (settlementOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Settlement settlement = settlementOpt.get();
            if ("REFUNDED".equalsIgnoreCase(settlement.getStatus()) || "CANCELLED".equalsIgnoreCase(settlement.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot settle a refunded or cancelled order.");
            }
            if ("SETTLED".equalsIgnoreCase(settlement.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Settlement record is already marked as SETTLED.");
            }

            settlement.setStatus("SETTLED");
            settlement.setSettledAt(new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date()));
            Settlement saved = settlementRepository.save(settlement);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update settlement: " + e.getMessage());
        }
    }

    /**
     * Admin payment status monitoring overview & metrics
     */
    @GetMapping("/payment-monitoring")
    public ResponseEntity<?> getPaymentMonitoringOverview() {
        try {
            List<Order> allOrders = orderRepository.findAllByOrderByIdDesc().stream()
                    .filter(o -> o.getOrderId() != null && !o.getOrderId().startsWith("ORD-FAIL-") && !"FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                    .collect(Collectors.toList());

            long totalOrders = allOrders.size();
            long paidCount = allOrders.stream().filter(o -> "PAID".equalsIgnoreCase(o.getPaymentStatus())).count();
            long pendingCount = allOrders.stream().filter(o -> o.getPaymentStatus() == null || "PENDING".equalsIgnoreCase(o.getPaymentStatus()) || "REFUND_PENDING".equalsIgnoreCase(o.getPaymentStatus())).count();
            long failedCount = allOrders.stream().filter(o -> "FAILED".equalsIgnoreCase(o.getPaymentStatus())).count();
            long refundedCount = allOrders.stream().filter(o -> "REFUNDED".equalsIgnoreCase(o.getPaymentStatus()) || "PARTIALLY_REFUNDED".equalsIgnoreCase(o.getPaymentStatus())).count();

            double totalPaidVolume = 0;
            for (Order o : allOrders) {
                if ("PAID".equalsIgnoreCase(o.getPaymentStatus())) {
                    totalPaidVolume += o.getTotalAmount();
                } else if ("PARTIALLY_REFUNDED".equalsIgnoreCase(o.getPaymentStatus())) {
                    double refundedSum = refundRepository.findByOrderId(o.getOrderId()).stream()
                            .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                            .mapToDouble(Refund::getAmount)
                            .sum();
                    totalPaidVolume += Math.max(0, o.getTotalAmount() - refundedSum);
                }
            }

            Map<String, Object> metrics = new HashMap<>();
            metrics.put("totalOrders", totalOrders);
            metrics.put("paidCount", paidCount);
            metrics.put("pendingCount", pendingCount);
            metrics.put("failedCount", failedCount);
            metrics.put("refundedCount", refundedCount);
            metrics.put("totalPaidVolume", Math.round(totalPaidVolume * 100.0) / 100.0);

            Map<String, Object> response = new HashMap<>();
            response.put("metrics", metrics);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve payment monitoring overview: " + e.getMessage());
        }
    }

    /**
     * Get all return and refund requests across the marketplace
     */
    @GetMapping("/refunds")
    public ResponseEntity<?> getAllRefunds(@RequestParam(required = false) String status) {
        try {
            List<Map<String, Object>> requests = paymentService.getAllRefundRequests(status);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch refund requests: " + e.getMessage());
        }
    }

    /**
     * Admin accepts a return request.
     */
    @PostMapping("/refunds/{refundId}/accept")
    public ResponseEntity<?> acceptReturnRequest(@PathVariable Long refundId, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String adminNotes = payload != null && payload.containsKey("adminNotes") ? payload.get("adminNotes") : "Admin accepted the return request. Awaiting pickup and QC check.";
            Refund refund = paymentService.acceptReturnRequest(refundId, adminNotes);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to accept return request: " + e.getMessage());
        }
    }

    /**
     * Admin approves a return request after product is returned and QC inspection passes,
     * executing Razorpay test-mode refund.
     */
    @PostMapping("/refunds/{refundId}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable Long refundId, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String adminNotes = payload != null && payload.containsKey("adminNotes") ? payload.get("adminNotes") : "QC Passed. Refund approved.";
            Refund refund = paymentService.approveAndExecuteRefund(refundId, adminNotes);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RazorpayException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Razorpay refund failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to approve refund: " + e.getMessage());
        }
    }

    /**
     * Admin rejects a return request (e.g. Ineligible / Item damaged by customer / QC failed).
     */
    @PostMapping("/refunds/{refundId}/reject")
    public ResponseEntity<?> rejectRefund(@PathVariable Long refundId, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String rejectionReason = payload != null && payload.containsKey("rejectionReason") 
                    ? payload.get("rejectionReason") : "Return request rejected after inspection.";
            Refund refund = paymentService.rejectReturnRequest(refundId, rejectionReason);
            return ResponseEntity.ok(refund);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to reject refund: " + e.getMessage());
        }
    }

    /**
     * Get overall marketplace summary statistics
     */
    /**
     * Get overall marketplace summary statistics
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            List<Order> orders = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderId() != null && !o.getOrderId().startsWith("ORD-FAIL-") && !"FAILED".equalsIgnoreCase(o.getPaymentStatus()))
                    .collect(Collectors.toList());
            List<Refund> allRefunds = refundRepository.findAll();
            long totalOrdersCount = orders.size();

            // 1. Gross sales volume = sum of all order totals regardless of refund status (verified historical transaction volume)
            double grossSalesVolume = 0.0;
            for (Order o : orders) {
                grossSalesVolume += (o.getTotalAmount() > 0 ? o.getTotalAmount() : 0.0);
            }

            // 2. Total refunded = sum of all processed refunds or refunded orders
            double totalRefunded = 0.0;
            for (Order o : orders) {
                String st = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                String paySt = o.getPaymentStatus() != null ? o.getPaymentStatus().toUpperCase() : "";

                if ("REFUNDED".equals(st) || "REFUNDED".equals(paySt)) {
                    totalRefunded += o.getTotalAmount();
                } else if ("PARTIALLY_REFUNDED".equals(st) || "PARTIALLY_REFUNDED".equals(paySt)) {
                    double refSum = allRefunds.stream()
                            .filter(r -> o.getOrderId().equals(r.getOrderId()) && ("PROCESSED".equalsIgnoreCase(r.getStatus()) || "REFUNDED".equalsIgnoreCase(r.getStatus())))
                            .mapToDouble(Refund::getAmount)
                            .sum();
                    totalRefunded += Math.min(refSum, o.getTotalAmount());
                } else {
                    double refSum = allRefunds.stream()
                            .filter(r -> o.getOrderId().equals(r.getOrderId()) && ("PROCESSED".equalsIgnoreCase(r.getStatus()) || "REFUNDED".equalsIgnoreCase(r.getStatus())))
                            .mapToDouble(Refund::getAmount)
                            .sum();
                    if (refSum > 0) {
                        totalRefunded += Math.min(refSum, o.getTotalAmount());
                    }
                }
            }
            totalRefunded = Math.min(totalRefunded, grossSalesVolume);

            // 3. Platform commission rate (fixed 10.0%)
            double commissionRate = 0.10;

            // 4. Platform revenue = (gross_sales_volume * commission_rate) - (total_refunded * commission_rate)
            double platformRevenue = Math.max(0.0, (grossSalesVolume * commissionRate) - (totalRefunded * commissionRate));

            // 5. Net vendor payouts = (gross_sales_volume - total_refunded) - platform_revenue
            double netVendorPayouts = Math.max(0.0, (grossSalesVolume - totalRefunded) - platformRevenue);

            List<Product> products = productRepository.findAll();
            long totalProductsCount = products.size();
            long pendingProductsCount = products.stream().filter(p -> "PENDING".equalsIgnoreCase(p.getStatus())).count();
            long approvedProductsCount = products.stream().filter(p -> "APPROVED".equalsIgnoreCase(p.getStatus())).count();
            long lowStockProductsCount = products.stream().filter(p -> p.getStock() != null && p.getStock() <= 5).count();

            long totalVendorsCount = userRepository.countByRole("VENDOR");
            long totalCustomersCount = userRepository.countByRole("CUSTOMER");

            Map<String, Long> categoryDistribution = new HashMap<>();
            for (Product p : products) {
                if (p.getCategory() != null) {
                    categoryDistribution.put(p.getCategory(), categoryDistribution.getOrDefault(p.getCategory(), 0L) + 1);
                }
            }

            List<Order> recentOrders = orders.stream()
                    .sorted((a, b) -> Long.compare(b.getId() != null ? b.getId() : 0, a.getId() != null ? a.getId() : 0))
                    .collect(Collectors.toList());
            if (recentOrders.size() > 5) {
                recentOrders = recentOrders.subList(0, 5);
            }

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalSalesVolume", Math.round(grossSalesVolume * 100.0) / 100.0);
            summary.put("totalRefunded", Math.round(totalRefunded * 100.0) / 100.0);
            summary.put("totalCommission", Math.round(platformRevenue * 100.0) / 100.0);
            summary.put("totalPayouts", Math.round(netVendorPayouts * 100.0) / 100.0);
            summary.put("commissionRate", 10.0);
            summary.put("totalOrders", totalOrdersCount);
            summary.put("totalProducts", totalProductsCount);
            summary.put("pendingProducts", pendingProductsCount);
            summary.put("approvedProducts", approvedProductsCount);
            summary.put("lowStockProducts", lowStockProductsCount);
            summary.put("totalVendors", totalVendorsCount);
            summary.put("totalCustomers", totalCustomersCount);
            summary.put("categoryDistribution", categoryDistribution);
            summary.put("recentOrders", recentOrders);

            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve dashboard summary: " + e.getMessage());
        }
    }

    /**
     * Get vendor profiles with cumulative statistics
     */
    @GetMapping("/vendors")
    public ResponseEntity<?> getVendorsStats() {
        try {
            List<User> vendors = userRepository.findByRole("VENDOR");
            List<Map<String, Object>> statsList = new ArrayList<>();
            List<Product> allProducts = productRepository.findAll();
            List<Settlement> allSettlements = settlementRepository.findAll();
            List<Order> allOrders = orderRepository.findAll();
            Map<String, String> orderStatusMap = allOrders.stream()
                    .collect(Collectors.toMap(Order::getOrderId, o -> o.getStatus() != null ? o.getStatus().toUpperCase() : "", (a, b) -> a));

            for (User v : vendors) {
                List<Product> vProducts = allProducts.stream()
                        .filter(p -> v.getId().equals(p.getVendorId()))
                        .collect(Collectors.toList());

                List<Settlement> vSettlements = allSettlements.stream()
                        .filter(s -> v.getId().equals(s.getVendorId()))
                        .collect(Collectors.toList());

                double grossSales = 0;
                double commission = 0;
                double netPayout = 0;
                long pendingPayoutsCount = 0;

                for (Settlement s : vSettlements) {
                    String ordSt = orderStatusMap.getOrDefault(s.getOrderId(), "");
                    if ("REFUNDED".equalsIgnoreCase(s.getStatus()) || "CANCELLED".equalsIgnoreCase(s.getStatus()) || "REFUNDED".equalsIgnoreCase(ordSt) || "CANCELLED".equalsIgnoreCase(ordSt)) {
                        if (!"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                            s.setStatus("REFUNDED".equalsIgnoreCase(ordSt) ? "REFUNDED" : "CANCELLED");
                            try { settlementRepository.save(s); } catch (Exception ignored) {}
                        }
                        continue;
                    }

                    grossSales += s.getGrossAmount();
                    commission += s.getCommissionAmount();
                    netPayout += s.getNetPayoutAmount();
                    if (!"SETTLED".equalsIgnoreCase(s.getStatus())) {
                        pendingPayoutsCount++;
                    }
                }

                Map<String, Object> vStat = new HashMap<>();
                vStat.put("id", v.getId());
                vStat.put("fullName", v.getFullName());
                vStat.put("email", v.getEmail());
                vStat.put("phone", v.getPhone());
                vStat.put("address", v.getAddress());
                vStat.put("vendorCode", v.getVendorCode());
                vStat.put("commissionRate", 10.0);
                vStat.put("totalProducts", vProducts.size());
                vStat.put("grossSales", Math.round(grossSales * 100.0) / 100.0);
                vStat.put("commissionPaid", Math.round(commission * 100.0) / 100.0);
                vStat.put("netPayout", Math.round(netPayout * 100.0) / 100.0);
                vStat.put("pendingPayoutsCount", pendingPayoutsCount);
                vStat.put("status", "ACTIVE");

                statsList.add(vStat);
            }

            return ResponseEntity.ok(statsList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve vendor stats: " + e.getMessage());
        }
    }

    /**
     * Get system and service health status
     */
    @GetMapping("/system-status")
    public ResponseEntity<?> getSystemStatus() {
        try {
            Runtime runtime = Runtime.getRuntime();
            double maxMem = runtime.maxMemory() / (1024.0 * 1024.0);
            double totalMem = runtime.totalMemory() / (1024.0 * 1024.0);
            double freeMem = runtime.freeMemory() / (1024.0 * 1024.0);
            double usedMem = totalMem - freeMem;

            int processors = runtime.availableProcessors();
            long uptimeMs = java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime();
            long seconds = uptimeMs / 1000;
            long minutes = seconds / 60;
            long hours = minutes / 60;
            String uptimeStr = String.format("%02d:%02d:%02d", hours, minutes % 60, seconds % 60);

            long userCount = userRepository.count();
            long productCount = productRepository.count();
            long orderCount = orderRepository.count();
            long settlementCount = settlementRepository.count();
            long refundCount = refundRepository.count();

            long imageFilesCount = 0;
            long totalStorageSizeBytes = 0;
            try {
                java.io.File uploadsDir = new java.io.File("uploads");
                if (uploadsDir.exists() && uploadsDir.isDirectory()) {
                    List<java.io.File> filesList = new ArrayList<>();
                    findFilesRecursively(uploadsDir, filesList);
                    imageFilesCount = filesList.size();
                    for (java.io.File f : filesList) {
                        totalStorageSizeBytes += f.length();
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            Map<String, Object> statusMap = new HashMap<>();
            statusMap.put("apiStatus", "ONLINE");
            statusMap.put("dbStatus", "ONLINE");
            statusMap.put("razorpayStatus", "CONFIGURED");
            statusMap.put("uptime", uptimeStr);
            statusMap.put("processors", processors);
            statusMap.put("jvmMaxMemory", Math.round(maxMem * 10.0) / 10.0);
            statusMap.put("jvmTotalMemory", Math.round(totalMem * 10.0) / 10.0);
            statusMap.put("jvmUsedMemory", Math.round(usedMem * 10.0) / 10.0);
            statusMap.put("jvmFreeMemory", Math.round(freeMem * 10.0) / 10.0);
            statusMap.put("dbTotalUsers", userCount);
            statusMap.put("dbTotalProducts", productCount);
            statusMap.put("dbTotalOrders", orderCount);
            statusMap.put("dbTotalSettlements", settlementCount);
            statusMap.put("dbTotalRefunds", refundCount);
            statusMap.put("storageImagesCount", imageFilesCount);
            statusMap.put("storageTotalSizeMB", Math.round((totalStorageSizeBytes / (1024.0 * 1024.0)) * 100.0) / 100.0);

            return ResponseEntity.ok(statusMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve system status: " + e.getMessage());
        }
    }

    private void findFilesRecursively(java.io.File folder, List<java.io.File> result) {
        java.io.File[] files = folder.listFiles();
        if (files == null) return;
        for (java.io.File f : files) {
            if (f.isDirectory()) {
                findFilesRecursively(f, result);
            } else {
                result.add(f);
            }
        }
    }

    /**
     * Generate business reports structured data
     */
    @GetMapping("/reports/generate")
    public ResponseEntity<?> generateReport(@RequestParam String type) {
        try {
            List<?> records = getReportData(type);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate report: " + e.getMessage());
        }
    }

    /**
     * Export reports as standard CSV stream download
     */
    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReport(@RequestParam String type) {
        try {
            StringBuilder csvBuilder = new StringBuilder();
            String filename = "report_" + type.toLowerCase() + "_" + System.currentTimeMillis() + ".csv";

            if ("SALES".equalsIgnoreCase(type)) {
                csvBuilder.append("Order ID,Date,Recipient Name,Payment Method,Payment Status,Total Amount\n");
                List<Order> orders = orderRepository.findAllByOrderByIdDesc();
                for (Order o : orders) {
                    csvBuilder.append(String.format("%s,%s,%s,%s,%s,%.2f\n",
                            escapeCsv(o.getOrderId()),
                            escapeCsv(o.getDate()),
                            escapeCsv(o.getRecipientName()),
                            escapeCsv(o.getPaymentMethod()),
                            escapeCsv(o.getPaymentStatus()),
                            o.getTotalAmount()
                    ));
                }
            } else if ("VENDORS".equalsIgnoreCase(type)) {
                csvBuilder.append("Vendor ID,Full Name,Email,Vendor Code,Products Count,Gross Sales,CommissionPaid,Net Payout\n");
                List<User> vendors = userRepository.findByRole("VENDOR");
                List<Product> allProducts = productRepository.findAll();
                List<Settlement> allSettlements = settlementRepository.findAll();
                for (User v : vendors) {
                    long productsCount = allProducts.stream().filter(p -> v.getId().equals(p.getVendorId())).count();
                    double grossSales = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getGrossAmount).sum();
                    double commission = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getCommissionAmount).sum();
                    double netPayout = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getNetPayoutAmount).sum();

                    csvBuilder.append(String.format("%d,%s,%s,%s,%d,%.2f,%.2f,%.2f\n",
                            v.getId(),
                            escapeCsv(v.getFullName()),
                            escapeCsv(v.getEmail()),
                            escapeCsv(v.getVendorCode()),
                            productsCount,
                            grossSales,
                            commission,
                            netPayout
                    ));
                }
            } else if ("INVENTORY".equalsIgnoreCase(type)) {
                csvBuilder.append("Product ID,Product Name,Category,Brand,Stock,Base Price,Final Price,Status\n");
                List<Product> products = productRepository.findAll();
                for (Product p : products) {
                    csvBuilder.append(String.format("%d,%s,%s,%s,%d,%.2f,%.2f,%s\n",
                            p.getId(),
                            escapeCsv(p.getName()),
                            escapeCsv(p.getCategory()),
                            escapeCsv(p.getBrand()),
                            p.getStock(),
                            p.getPrice(),
                            p.getFinalPrice(),
                            escapeCsv(p.getStatus())
                    ));
                }
            } else if ("REFUNDS".equalsIgnoreCase(type)) {
                csvBuilder.append("Refund ID,Order ID,Amount,Reason Category,Resolution,Stage,Status,Requested At\n");
                List<Refund> refunds = refundRepository.findAllByOrderByIdDesc();
                for (Refund r : refunds) {
                    csvBuilder.append(String.format("%d,%s,%.2f,%s,%s,%s,%s,%s\n",
                            r.getId(),
                            escapeCsv(r.getOrderId()),
                            r.getAmount(),
                            escapeCsv(r.getReturnReasonCategory()),
                            escapeCsv(r.getResolutionType()),
                            escapeCsv(r.getReturnStage()),
                            escapeCsv(r.getStatus()),
                            escapeCsv(r.getRequestedAt())
                    ));
                }
            } else {
                csvBuilder.append("Error: Unsupported report type.");
            }

            byte[] csvBytes = csvBuilder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv"));

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private List<?> getReportData(String type) {
        if ("SALES".equalsIgnoreCase(type)) {
            return orderRepository.findAllByOrderByIdDesc();
        } else if ("VENDORS".equalsIgnoreCase(type)) {
            List<User> vendors = userRepository.findByRole("VENDOR");
            List<Map<String, Object>> vStats = new ArrayList<>();
            List<Product> allProducts = productRepository.findAll();
            List<Settlement> allSettlements = settlementRepository.findAll();
            for (User v : vendors) {
                long productsCount = allProducts.stream().filter(p -> v.getId().equals(p.getVendorId())).count();
                double grossSales = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getGrossAmount).sum();
                double commission = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getCommissionAmount).sum();
                double netPayout = allSettlements.stream().filter(s -> v.getId().equals(s.getVendorId()) && !"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())).mapToDouble(Settlement::getNetPayoutAmount).sum();

                Map<String, Object> m = new HashMap<>();
                m.put("id", v.getId());
                m.put("fullName", v.getFullName());
                m.put("email", v.getEmail());
                m.put("vendorCode", v.getVendorCode());
                m.put("commissionRate", 10.0);
                m.put("totalProducts", productsCount);
                m.put("grossSales", grossSales);
                m.put("commissionPaid", commission);
                m.put("netPayout", netPayout);
                vStats.add(m);
            }
            return vStats;
        } else if ("INVENTORY".equalsIgnoreCase(type)) {
            return productRepository.findAll();
        } else if ("REFUNDS".equalsIgnoreCase(type)) {
            return refundRepository.findAllByOrderByIdDesc();
        }
        return new ArrayList<>();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    /**
     * Update a vendor's custom commission rate
     */
    @PutMapping("/vendors/{vendorId}/commission-rate")
    public ResponseEntity<?> updateVendorCommissionRate(@PathVariable Long vendorId, @RequestBody Map<String, Object> payload) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Vendor-specific commission rates are disabled. The platform commission rate is fixed at 10.0%.");
    }

    /**
     * Inspect all products listed by a specific vendor (Admin view)
     */
    @GetMapping("/vendors/{vendorId}/products")
    public ResponseEntity<?> getVendorProducts(@PathVariable Long vendorId) {
        try {
            List<Product> products = productRepository.findAll().stream()
                    .filter(p -> p.getVendorId() != null && p.getVendorId().equals(vendorId))
                    .map(this::populateProductRatings)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve vendor products: " + e.getMessage());
        }
    }

    /**
     * Admin permanently deletes a product and cleans up all related disk storage and records
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/products/{productId}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> adminDeleteProduct(@PathVariable Long productId) {
        try {
            Optional<Product> optional = productRepository.findById(productId);
            if (optional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Product p = optional.get();
            if (p.getImageUrl() != null) {
                fileStorageService.deleteFile(p.getImageUrl());
            }
            if (p.getImages() != null) {
                for (String img : p.getImages()) {
                    fileStorageService.deleteFile(img);
                }
            }

            // 1. Inbound Shipments referencing product (foreign key parent)
            try {
                List<com.shopstack.backend.model.InboundShipment> shipments = inboundShipmentRepository.findAll().stream()
                        .filter(s -> s.getProduct() != null && productId.equals(s.getProduct().getId()))
                        .collect(Collectors.toList());
                if (!shipments.isEmpty()) {
                    inboundShipmentRepository.deleteAll(shipments);
                }
            } catch (Exception ex) {
                System.err.println("Note cleaning shipments: " + ex.getMessage());
            }

            // 2. Stock Transfers referencing product (foreign key parent)
            try {
                List<com.shopstack.backend.model.StockTransfer> transfers = stockTransferRepository.findAll().stream()
                        .filter(t -> t.getProduct() != null && productId.equals(t.getProduct().getId()))
                        .collect(Collectors.toList());
                if (!transfers.isEmpty()) {
                    stockTransferRepository.deleteAll(transfers);
                }
            } catch (Exception ex) {
                System.err.println("Note cleaning transfers: " + ex.getMessage());
            }

            // 3. Keep historical WarehouseAllocation records for past orders (no foreign key constraint)

            // 4. Warehouse Inventories
            try {
                List<com.shopstack.backend.model.Inventory> inventories = inventoryRepository.findByProductId(productId);
                if (inventories != null && !inventories.isEmpty()) {
                    inventoryRepository.deleteAll(inventories);
                }
            } catch (Exception ignored) {}

            // 5. Reviews
            try {
                List<com.shopstack.backend.model.Review> reviews = reviewRepository.findByProductIdOrderByIdDesc(productId);
                if (reviews != null && !reviews.isEmpty()) {
                    reviewRepository.deleteAll(reviews);
                }
            } catch (Exception ignored) {}

            // 6. Wishlist Items
            try {
                List<com.shopstack.backend.model.WishlistItem> wishlists = wishlistItemRepository.findAll().stream()
                        .filter(w -> productId.equals(w.getProductId()))
                        .collect(Collectors.toList());
                if (wishlists != null && !wishlists.isEmpty()) {
                    wishlistItemRepository.deleteAll(wishlists);
                }
            } catch (Exception ignored) {}

            // 7. Product Coupons
            try {
                List<com.shopstack.backend.model.ProductCoupon> coupons = productCouponRepository.findByProductId(productId);
                if (coupons != null && !coupons.isEmpty()) {
                    productCouponRepository.deleteAll(coupons);
                }
            } catch (Exception ignored) {}

            // 8. Clear collection elements
            if (p.getImages() != null) {
                p.getImages().clear();
                productRepository.saveAndFlush(p);
            }

            productRepository.deleteById(productId);
            return ResponseEntity.ok(Map.of("message", "Product deleted successfully by admin", "productId", productId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete product: " + e.getMessage());
        }
    }

    private Product populateProductRatings(Product p) {
        if (p.getDiscountPercentage() == null) {
            p.setDiscountPercentage(0.0);
        }
        if (p.getFinalPrice() == null) {
            p.setFinalPrice(p.calculateFinalPrice());
        }
        if (reviewRepository != null) {
            List<com.shopstack.backend.model.Review> reviews = reviewRepository.findByProductIdOrderByIdDesc(p.getId());
            if (reviews.isEmpty()) {
                p.setAverageRating(0.0);
                p.setReviewCount(0);
            } else {
                double sum = 0;
                for (com.shopstack.backend.model.Review r : reviews) {
                    sum += r.getRating();
                }
                p.setAverageRating(Math.round((sum / reviews.size()) * 10.0) / 10.0);
                p.setReviewCount(reviews.size());
            }
        }
        if (p.getVendorId() != null) {
            Optional<User> vendorOpt = userRepository.findById(p.getVendorId());
            if (vendorOpt.isPresent()) {
                User v = vendorOpt.get();
                p.setVendorName(v.getFullName());
                p.setVendorEmail(v.getEmail());
                p.setVendorPhone(v.getPhone());
                p.setVendorCode(v.getVendorCode());
                p.setVendorAddress(v.getAddress());
            }
        }

        // Dynamically populate actual available stock from warehouse inventory
        if (inventoryRepository != null) {
            List<com.shopstack.backend.model.Inventory> invs = inventoryRepository.findByProductId(p.getId());
            if (invs != null && !invs.isEmpty()) {
                int totalAvailable = invs.stream()
                        .mapToInt(com.shopstack.backend.model.Inventory::getAvailableQuantity)
                        .sum();
                p.setStock(totalAvailable);
            }
        }

        return p;
    }

    /**
     * Get all customer reviews with enriched product metadata and statistical breakdown
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews() {
        try {
            List<com.shopstack.backend.model.Review> reviews = reviewRepository.findAllByOrderByIdDesc();
            List<Product> allProducts = productRepository.findAll();
            Map<Long, Product> productMap = allProducts.stream()
                    .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

            List<Map<String, Object>> enrichedReviews = new ArrayList<>();
            double totalScore = 0;
            int star5 = 0, star4 = 0, star3 = 0, star2 = 0, star1 = 0;

            for (com.shopstack.backend.model.Review r : reviews) {
                Map<String, Object> rMap = new HashMap<>();
                rMap.put("id", r.getId());
                rMap.put("productId", r.getProductId());
                rMap.put("userId", r.getUserId());
                rMap.put("reviewerName", r.getReviewerName() != null ? r.getReviewerName() : "Customer");
                rMap.put("rating", r.getRating());
                rMap.put("comment", r.getComment());
                rMap.put("date", r.getDate());
                rMap.put("reviewImage", r.getImageUrl());

                Product prod = productMap.get(r.getProductId());
                if (prod != null) {
                    rMap.put("productName", prod.getName());
                    rMap.put("productCategory", prod.getCategory());
                    rMap.put("productPrice", prod.getPrice());
                    rMap.put("productImage", prod.getImages() != null && !prod.getImages().isEmpty() ? prod.getImages().get(0) : null);
                } else {
                    rMap.put("productName", "Product #" + r.getProductId());
                    rMap.put("productCategory", "General");
                    rMap.put("productPrice", 0.0);
                    rMap.put("productImage", null);
                }

                totalScore += r.getRating();
                if (r.getRating() == 5) star5++;
                else if (r.getRating() == 4) star4++;
                else if (r.getRating() == 3) star3++;
                else if (r.getRating() == 2) star2++;
                else if (r.getRating() == 1) star1++;

                enrichedReviews.add(rMap);
            }

            int totalCount = reviews.size();
            double avgRating = totalCount > 0 ? Math.round((totalScore / totalCount) * 10.0) / 10.0 : 0.0;

            Map<String, Object> breakdown = new HashMap<>();
            breakdown.put("5", star5);
            breakdown.put("4", star4);
            breakdown.put("3", star3);
            breakdown.put("2", star2);
            breakdown.put("1", star1);

            Map<String, Object> response = new HashMap<>();
            response.put("reviews", enrichedReviews);
            response.put("totalReviews", totalCount);
            response.put("averageRating", avgRating);
            response.put("breakdown", breakdown);
            response.put("positiveCount", star5 + star4);
            response.put("criticalCount", star1 + star2);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch reviews", "details", e.getMessage()));
        }
    }

    /**
     * Delete/Moderate customer review by ID
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            Optional<com.shopstack.backend.model.Review> opt = reviewRepository.findById(reviewId);
            if (opt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            reviewRepository.deleteById(reviewId);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Review deleted successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete review", "details", e.getMessage()));
        }
    }
}

