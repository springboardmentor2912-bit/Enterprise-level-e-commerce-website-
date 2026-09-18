package com.shopstack.service;

import com.shopstack.dto.AdminCommissionSummary;
import com.shopstack.dto.CommissionCalculationRequest;
import com.shopstack.dto.CommissionCalculationResponse;
import com.shopstack.dto.CommissionResponse;
import com.shopstack.model.*;
import com.shopstack.repository.CommissionRepository;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommissionService {

    public static final double DEFAULT_PLATFORM_COMMISSION_RATE = 10.0;

    private final CommissionRepository commissionRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final OrderRepository orderRepository;

    public CommissionService(CommissionRepository commissionRepository,
                             VendorProfileRepository vendorProfileRepository,
                             OrderRepository orderRepository) {
        this.commissionRepository = commissionRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Core Pure Commission Calculation:
     * Platform Commission = Order Amount * (Commission Rate / 100)
     * Vendor Amount = Order Amount - Platform Commission
     */
    public CommissionCalculationResponse calculateCommission(Double orderAmount, Double commissionRate) {
        if (orderAmount == null || orderAmount < 0) {
            throw new IllegalArgumentException("Order amount must be a non-negative value.");
        }

        double rate = (commissionRate != null && commissionRate >= 0 && commissionRate <= 100)
                ? commissionRate : DEFAULT_PLATFORM_COMMISSION_RATE;

        double commissionAmount = roundToTwoDecimals(orderAmount * (rate / 100.0));
        double vendorAmount = roundToTwoDecimals(orderAmount - commissionAmount);

        String formula = String.format(
                "Order Amount (₹%.2f) × Rate (%.2f%%) = Platform Cut: ₹%.2f | Vendor Net: ₹%.2f",
                orderAmount, rate, commissionAmount, vendorAmount
        );

        return new CommissionCalculationResponse(
                roundToTwoDecimals(orderAmount),
                rate,
                commissionAmount,
                vendorAmount,
                formula
        );
    }

    /**
     * Interactive calculation with optional vendor profile lookup.
     */
    public CommissionCalculationResponse simulateCommission(CommissionCalculationRequest request) {
        Double orderAmount = request.getOrderAmount() != null ? request.getOrderAmount() : 0.0;
        Double commissionRate = request.getCommissionRate();
        Long vendorId = request.getVendorId();
        String storeName = "Default Platform Merchant";

        if (vendorId != null) {
            Optional<VendorProfile> profileOpt = vendorProfileRepository.findById(vendorId);
            if (profileOpt.isPresent()) {
                VendorProfile vp = profileOpt.get();
                storeName = vp.getStoreName();
                if (commissionRate == null && vp.getCommissionRate() != null) {
                    commissionRate = vp.getCommissionRate();
                }
            }
        }

        if (commissionRate == null) {
            commissionRate = DEFAULT_PLATFORM_COMMISSION_RATE;
        }

        CommissionCalculationResponse calc = calculateCommission(orderAmount, commissionRate);
        calc.setVendorId(vendorId);
        calc.setVendorStoreName(storeName);
        return calc;
    }

    /**
     * Create or update commission record for a specific order.
     * Automatically identifies vendor, fetches applicable commission rate,
     * calculates platform fee and vendor payout, and persists the record.
     */
    @Transactional
    public Commission createOrUpdateCommissionForOrder(Order order) {
        if (order == null) {
            throw new IllegalArgumentException("Order cannot be null for commission creation.");
        }

        VendorProfile vendorProfile = order.getVendorProfile();
        if (vendorProfile == null) {
            throw new IllegalStateException("Order #" + order.getOrderNumber() + " must have an associated vendor profile.");
        }

        // Obtain commission rate from vendor profile or fallback to platform default
        double commissionRate = (vendorProfile.getCommissionRate() != null && vendorProfile.getCommissionRate() >= 0)
                ? vendorProfile.getCommissionRate() : DEFAULT_PLATFORM_COMMISSION_RATE;

        double orderAmount = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;

        CommissionCalculationResponse calc = calculateCommission(orderAmount, commissionRate);

        // Determine commission status based on order lifecycle
        CommissionStatus commissionStatus;
        if (order.getStatus() == OrderStatus.CANCELLED) {
            commissionStatus = CommissionStatus.CANCELLED;
        } else if (order.getPaymentStatus() == PaymentStatus.PAID || order.getStatus() == OrderStatus.DELIVERED) {
            commissionStatus = CommissionStatus.SETTLED;
        } else if (order.getStatus() == OrderStatus.CONFIRMED || order.getStatus() == OrderStatus.PROCESSING || order.getStatus() == OrderStatus.SHIPPED) {
            commissionStatus = CommissionStatus.CALCULATED;
        } else {
            commissionStatus = CommissionStatus.PENDING;
        }

        Optional<Commission> existingOpt = commissionRepository.findByOrderId(order.getId());
        Commission commission;

        if (existingOpt.isPresent()) {
            commission = existingOpt.get();
            commission.setVendorProfile(vendorProfile);
            commission.setOrderAmount(calc.getOrderAmount());
            commission.setCommissionRate(calc.getCommissionRate());
            commission.setCommissionAmount(calc.getCommissionAmount());
            commission.setVendorAmount(calc.getVendorAmount());
            commission.setStatus(commissionStatus);
            if (commissionStatus == CommissionStatus.SETTLED && commission.getSettledAt() == null) {
                commission.setSettledAt(LocalDateTime.now());
            }
        } else {
            commission = Commission.builder()
                    .order(order)
                    .vendorProfile(vendorProfile)
                    .orderAmount(calc.getOrderAmount())
                    .commissionRate(calc.getCommissionRate())
                    .commissionAmount(calc.getCommissionAmount())
                    .vendorAmount(calc.getVendorAmount())
                    .status(commissionStatus)
                    .createdAt(order.getCreatedAt() != null ? order.getCreatedAt() : LocalDateTime.now())
                    .settledAt(commissionStatus == CommissionStatus.SETTLED ? LocalDateTime.now() : null)
                    .build();
        }

        return commissionRepository.save(commission);
    }

    /**
     * Retrieve all commission records with optional vendor and status filters.
     */
    public List<CommissionResponse> getAllCommissions(Long vendorId, CommissionStatus status) {
        List<Commission> list;
        if (vendorId != null && status != null) {
            list = commissionRepository.findByVendorProfileIdAndStatusOrderByCreatedAtDesc(vendorId, status);
        } else if (vendorId != null) {
            list = commissionRepository.findByVendorProfileIdOrderByCreatedAtDesc(vendorId);
        } else if (status != null) {
            list = commissionRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            list = commissionRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream()
                .map(CommissionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Retrieve commission record by order ID.
     */
    public Optional<CommissionResponse> getCommissionByOrderId(Long orderId) {
        return commissionRepository.findByOrderId(orderId).map(CommissionResponse::fromEntity);
    }

    /**
     * Retrieve commission records for a specific vendor.
     */
    public List<CommissionResponse> getCommissionsByVendor(Long vendorId) {
        return commissionRepository.findByVendorProfileIdOrderByCreatedAtDesc(vendorId).stream()
                .map(CommissionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update settlement / payout status of a commission record.
     */
    @Transactional
    public CommissionResponse updateCommissionStatus(Long commissionId, CommissionStatus newStatus) {
        Commission commission = commissionRepository.findById(commissionId)
                .orElseThrow(() -> new RuntimeException("Commission record not found with ID: " + commissionId));

        commission.setStatus(newStatus);
        if (newStatus == CommissionStatus.SETTLED || newStatus == CommissionStatus.PAID) {
            if (commission.getSettledAt() == null) {
                commission.setSettledAt(LocalDateTime.now());
            }
        }

        Commission saved = commissionRepository.save(commission);
        return CommissionResponse.fromEntity(saved);
    }

    /**
     * Comprehensive Marketplace Commission Summary:
     * - Gross Marketplace Sales
     * - Total Commission Earned (Platform Cut)
     * - Total Vendor Payouts
     * - Average Commission Rate
     * - Per-Vendor Breakdown Line Items
     */
    public AdminCommissionSummary getCommissionSummary() {
        List<VendorProfile> vendors = vendorProfileRepository.findAll();
        List<Commission> allCommissions = commissionRepository.findAll();

        double totalGrossSales = 0.0;
        double totalCommissionEarned = 0.0;
        List<AdminCommissionSummary.VendorCommissionLine> vendorLines = new ArrayList<>();

        for (VendorProfile vendor : vendors) {
            List<Commission> vCommissions = allCommissions.stream()
                    .filter(c -> c.getVendorProfile() != null && c.getVendorProfile().getId().equals(vendor.getId()))
                    .filter(c -> c.getStatus() != CommissionStatus.CANCELLED)
                    .collect(Collectors.toList());

            double vGross = vCommissions.stream().mapToDouble(Commission::getOrderAmount).sum();
            double vComm = vCommissions.stream().mapToDouble(Commission::getCommissionAmount).sum();
            double vPayable = vCommissions.stream().mapToDouble(Commission::getVendorAmount).sum();
            double rate = vendor.getCommissionRate() != null ? vendor.getCommissionRate() : DEFAULT_PLATFORM_COMMISSION_RATE;

            totalGrossSales += vGross;
            totalCommissionEarned += vComm;

            User owner = vendor.getUser();
            String payoutStatus = vCommissions.stream().anyMatch(c -> c.getStatus() == CommissionStatus.PAID)
                    ? "PAID" : (vGross > 0 ? "SETTLED" : "READY");

            vendorLines.add(new AdminCommissionSummary.VendorCommissionLine(
                    vendor.getId(),
                    vendor.getStoreName(),
                    owner != null ? owner.getFullName() : "Store Merchant",
                    owner != null ? owner.getEmail() : "N/A",
                    rate,
                    vCommissions.size(),
                    roundToTwoDecimals(vGross),
                    roundToTwoDecimals(vComm),
                    roundToTwoDecimals(vPayable),
                    payoutStatus
            ));
        }

        double totalVendorPayouts = roundToTwoDecimals(totalGrossSales - totalCommissionEarned);
        double avgRate = vendors.isEmpty() ? DEFAULT_PLATFORM_COMMISSION_RATE :
                vendors.stream().mapToDouble(v -> v.getCommissionRate() != null ? v.getCommissionRate() : DEFAULT_PLATFORM_COMMISSION_RATE).average().orElse(DEFAULT_PLATFORM_COMMISSION_RATE);

        return new AdminCommissionSummary(
                roundToTwoDecimals(totalGrossSales),
                roundToTwoDecimals(totalCommissionEarned),
                totalVendorPayouts,
                roundToTwoDecimals(avgRate),
                vendorLines
        );
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
