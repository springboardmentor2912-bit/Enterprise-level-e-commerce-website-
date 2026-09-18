package com.infosys.auth.service;

import com.infosys.auth.model.Order;
import com.infosys.auth.model.OrderItem;
import com.infosys.auth.model.Product;
import com.infosys.auth.model.VendorCommission;
import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.repository.OrderRepository;
import com.infosys.auth.repository.ProductRepository;
import com.infosys.auth.repository.VendorCommissionRepository;
import com.infosys.auth.repository.VendorProfileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CommissionService {

    @Value("${shopstack.commission.rate:10.0}")
    private BigDecimal defaultCommissionRate = new BigDecimal("10.0");

    private final VendorCommissionRepository vendorCommissionRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public CommissionService(VendorCommissionRepository vendorCommissionRepository,
                             VendorProfileRepository vendorProfileRepository,
                             ProductRepository productRepository,
                             OrderRepository orderRepository,
                             NotificationService notificationService) {
        this.vendorCommissionRepository = vendorCommissionRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    public BigDecimal getDefaultCommissionRate() {
        return defaultCommissionRate;
    }

    public void setDefaultCommissionRate(BigDecimal rate) {
        if (rate != null && rate.compareTo(BigDecimal.ZERO) >= 0) {
            this.defaultCommissionRate = rate;
        }
    }

    /**
     * Pure calculation logic for testing and API responses.
     */
    public Map<String, Object> calculateCommission(BigDecimal orderAmount, BigDecimal commissionRate) {
        if (orderAmount == null || orderAmount.compareTo(BigDecimal.ZERO) < 0) {
            orderAmount = BigDecimal.ZERO;
        }
        BigDecimal rate = (commissionRate != null && commissionRate.compareTo(BigDecimal.ZERO) >= 0)
                ? commissionRate : defaultCommissionRate;

        BigDecimal commissionAmount = orderAmount.multiply(rate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal vendorAmount = orderAmount.subtract(commissionAmount)
                .setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderAmount", orderAmount);
        result.put("commissionRate", rate);
        result.put("commissionAmount", commissionAmount);
        result.put("vendorAmount", vendorAmount);
        return result;
    }

    /**
     * Identifies vendor for order items, calculates platform commission and vendor amount,
     * and stores commission records in the database.
     */
    @Transactional
    public List<VendorCommission> createCommissionsForOrder(Order order) {
        if (order == null || order.getId() == null) {
            return Collections.emptyList();
        }

        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        // Group items by vendorId
        Map<Long, List<OrderItem>> vendorItemMap = new HashMap<>();
        for (OrderItem item : items) {
            Long vendorId = item.getVendorId();
            if (vendorId == null && item.getProductId() != null) {
                Optional<Product> prodOpt = productRepository.findById(item.getProductId());
                if (prodOpt.isPresent()) {
                    vendorId = prodOpt.get().getVendorId();
                }
            }
            if (vendorId == null) {
                vendorId = 1L; // default fallback vendor ID
            }
            vendorItemMap.computeIfAbsent(vendorId, k -> new ArrayList<>()).add(item);
        }

        List<VendorCommission> createdCommissions = new ArrayList<>();

        for (Map.Entry<Long, List<OrderItem>> entry : vendorItemMap.entrySet()) {
            Long vendorId = entry.getKey();
            List<OrderItem> vendorItems = entry.getValue();

            // Calculate order amount for this specific vendor
            BigDecimal vendorSaleAmount = BigDecimal.ZERO;
            for (OrderItem item : vendorItems) {
                BigDecimal itemPrice = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
                int qty = item.getQuantity() != null ? item.getQuantity() : 1;
                vendorSaleAmount = vendorSaleAmount.add(itemPrice.multiply(BigDecimal.valueOf(qty)));
            }

            if (vendorSaleAmount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            // Check idempotency: avoid duplicate records for the same order and vendor
            if (vendorCommissionRepository.existsByOrderIdAndVendorId(order.getId(), vendorId)) {
                List<VendorCommission> existing = vendorCommissionRepository.findByOrderId(order.getId());
                createdCommissions.addAll(existing);
                continue;
            }

            // Resolve vendor store name
            String storeName = "Vendor #" + vendorId;
            Optional<VendorProfile> vpOpt = vendorProfileRepository.findByUserId(vendorId);
            if (vpOpt.isEmpty()) {
                vpOpt = vendorProfileRepository.findById(vendorId);
            }
            if (vpOpt.isPresent()) {
                storeName = vpOpt.get().getStoreName();
            }

            // Calculate platform commission and vendor net amount
            Map<String, Object> calc = calculateCommission(vendorSaleAmount, defaultCommissionRate);
            BigDecimal commissionAmount = (BigDecimal) calc.get("commissionAmount");
            BigDecimal vendorAmount = (BigDecimal) calc.get("vendorAmount");

            VendorCommission commission = new VendorCommission(
                    order.getId(),
                    vendorId,
                    storeName,
                    vendorSaleAmount,
                    defaultCommissionRate,
                    commissionAmount,
                    vendorAmount,
                    "PENDING"
            );

            VendorCommission saved = vendorCommissionRepository.save(commission);
            createdCommissions.add(saved);

            // Send notification to vendor
            try {
                notificationService.createNotification(vendorId, "NEW_COMMISSION",
                        "Commission recorded for Order #" + order.getId() + ": Gross ₹" + vendorSaleAmount +
                                ", Platform Fee ₹" + commissionAmount + " (" + defaultCommissionRate + "%), Vendor Earnings ₹" + vendorAmount);
            } catch (Exception ignored) {}
        }

        return createdCommissions;
    }

    /**
     * Retrieves all commission records.
     */
    public List<VendorCommission> getAllCommissions() {
        backfillHistoricalOrdersIfNeeded();
        return vendorCommissionRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Retrieves commission records for a specific vendor.
     */
    public List<VendorCommission> getCommissionsByVendor(Long vendorId) {
        backfillHistoricalOrdersIfNeeded();
        return vendorCommissionRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    /**
     * Aggregates financial overview metrics and vendor breakdown ledger for Admin Dashboard.
     */
    public Map<String, Object> getCommissionSummary() {
        backfillHistoricalOrdersIfNeeded();

        List<VendorCommission> allCommissions = vendorCommissionRepository.findAllByOrderByCreatedAtDesc();

        BigDecimal totalGrossSales = BigDecimal.ZERO;
        BigDecimal totalPlatformCommission = BigDecimal.ZERO;
        BigDecimal totalVendorNetPayout = BigDecimal.ZERO;

        for (VendorCommission vc : allCommissions) {
            totalGrossSales = totalGrossSales.add(vc.getOrderAmount() != null ? vc.getOrderAmount() : BigDecimal.ZERO);
            totalPlatformCommission = totalPlatformCommission.add(vc.getCommissionAmount() != null ? vc.getCommissionAmount() : BigDecimal.ZERO);
            totalVendorNetPayout = totalVendorNetPayout.add(vc.getVendorAmount() != null ? vc.getVendorAmount() : BigDecimal.ZERO);
        }

        // Group commissions by vendor for aggregated vendor breakdown
        Map<Long, List<VendorCommission>> vendorGroup = allCommissions.stream()
                .collect(Collectors.groupingBy(VendorCommission::getVendorId));

        List<VendorProfile> allVendors = vendorProfileRepository.findAll();
        Set<Long> processedVendorIds = new HashSet<>();
        List<Map<String, Object>> vendorCommissionsList = new ArrayList<>();

        for (Map.Entry<Long, List<VendorCommission>> entry : vendorGroup.entrySet()) {
            Long vId = entry.getKey();
            processedVendorIds.add(vId);
            List<VendorCommission> list = entry.getValue();

            BigDecimal vendorGross = list.stream()
                    .map(VendorCommission::getOrderAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal vendorFee = list.stream()
                    .map(VendorCommission::getCommissionAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal vendorNet = list.stream()
                    .map(VendorCommission::getVendorAmount)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            String storeName = list.get(0).getVendorName();
            String email = "vendor" + vId + "@shopstack.com";
            Optional<VendorProfile> vpOpt = vendorProfileRepository.findByUserId(vId);
            if (vpOpt.isEmpty()) vpOpt = vendorProfileRepository.findById(vId);
            if (vpOpt.isPresent()) {
                storeName = vpOpt.get().getStoreName();
                email = vpOpt.get().getBusinessEmail();
            }

            boolean allPaid = list.stream().allMatch(c -> "PAID".equalsIgnoreCase(c.getStatus()));
            String payoutStatus = allPaid ? "PAID" : "PENDING";

            Map<String, Object> vMap = new HashMap<>();
            vMap.put("vendorId", vId);
            vMap.put("storeName", storeName);
            vMap.put("businessEmail", email);
            vMap.put("grossSales", vendorGross);
            vMap.put("commissionRate", defaultCommissionRate + "%");
            vMap.put("platformFee", vendorFee);
            vMap.put("netPayout", vendorNet);
            vMap.put("payoutStatus", payoutStatus);
            vendorCommissionsList.add(vMap);
        }

        // Add vendors with zero sales for completeness
        for (VendorProfile vp : allVendors) {
            Long vId = vp.getUserId();
            if (!processedVendorIds.contains(vId) && !processedVendorIds.contains(vp.getId())) {
                Map<String, Object> vMap = new HashMap<>();
                vMap.put("vendorId", vp.getId());
                vMap.put("storeName", vp.getStoreName());
                vMap.put("businessEmail", vp.getBusinessEmail());
                vMap.put("grossSales", BigDecimal.ZERO);
                vMap.put("commissionRate", defaultCommissionRate + "%");
                vMap.put("platformFee", BigDecimal.ZERO);
                vMap.put("netPayout", BigDecimal.ZERO);
                vMap.put("payoutStatus", "PAID");
                vendorCommissionsList.add(vMap);
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("commissionRate", defaultCommissionRate);
        response.put("totalGrossSales", totalGrossSales);
        response.put("totalPlatformCommission", totalPlatformCommission);
        response.put("totalVendorNetPayout", totalVendorNetPayout);
        response.put("vendorCommissions", vendorCommissionsList);
        response.put("commissionRecords", allCommissions);
        return response;
    }

    @Transactional
    public VendorCommission updateCommissionStatus(Long commissionId, String status) {
        VendorCommission commission = vendorCommissionRepository.findById(commissionId)
                .orElseThrow(() -> new RuntimeException("Commission record not found with ID: " + commissionId));
        commission.setStatus(status.toUpperCase());
        return vendorCommissionRepository.save(commission);
    }

    @Transactional
    public Map<String, String> updateVendorPayoutStatus(Long vendorId, String status) {
        List<VendorCommission> commissions = vendorCommissionRepository.findByVendorId(vendorId);
        if (commissions.isEmpty()) {
            // Check by profile id
            Optional<VendorProfile> vpOpt = vendorProfileRepository.findById(vendorId);
            if (vpOpt.isPresent()) {
                commissions = vendorCommissionRepository.findByVendorId(vpOpt.get().getUserId());
            }
        }
        for (VendorCommission vc : commissions) {
            vc.setStatus(status.toUpperCase());
            vendorCommissionRepository.save(vc);
        }

        Optional<VendorProfile> vpOpt = vendorProfileRepository.findByUserId(vendorId);
        if (vpOpt.isEmpty()) vpOpt = vendorProfileRepository.findById(vendorId);
        vpOpt.ifPresent(v -> notificationService.createNotification(v.getUserId(), "COMMISSION_PAYOUT",
                "Your vendor payout status has been updated to: " + status.toUpperCase()));

        return Map.of("status", "SUCCESS", "message", "Payout status updated to " + status.toUpperCase());
    }

    /**
     * Backfills commission calculations for any existing orders that were created prior to this module.
     */
    private void backfillHistoricalOrdersIfNeeded() {
        if (vendorCommissionRepository.count() == 0) {
            List<Order> orders = orderRepository.findAll();
            for (Order o : orders) {
                createCommissionsForOrder(o);
            }
        }
    }
}
