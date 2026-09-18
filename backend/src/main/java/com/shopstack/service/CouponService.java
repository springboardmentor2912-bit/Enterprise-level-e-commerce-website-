package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.CouponRepository;
import com.shopstack.repository.CouponUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public CouponService(CouponRepository couponRepository, CouponUsageRepository couponUsageRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    /**
     * Core Validation & Discount Calculation Engine.
     */
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String code, Double orderAmount, Long userId) {
        if (code == null || code.trim().isEmpty()) {
            return CouponValidationResponse.invalid("", "Please enter a valid coupon code.");
        }

        String cleanCode = code.trim().toUpperCase();

        if (orderAmount == null || orderAmount <= 0) {
            return CouponValidationResponse.invalid(cleanCode, "Invalid order amount for coupon application.");
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(cleanCode);
        if (couponOpt.isEmpty()) {
            return CouponValidationResponse.invalid(cleanCode, "Coupon code '" + cleanCode + "' does not exist.");
        }

        Coupon coupon = couponOpt.get();

        // 1. Check Active status
        if (!Boolean.TRUE.equals(coupon.getActive())) {
            return CouponValidationResponse.invalid(cleanCode, "Coupon code '" + cleanCode + "' is currently inactive.");
        }

        LocalDateTime now = LocalDateTime.now();

        // 2. Check Start Date
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return CouponValidationResponse.invalid(cleanCode, "Coupon '" + cleanCode + "' is not active yet. Valid from " + coupon.getStartDate().toLocalDate());
        }

        // 3. Check Expiration Date
        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            return CouponValidationResponse.invalid(cleanCode, "Coupon code '" + cleanCode + "' has expired.");
        }

        // 4. Check Minimum Order Amount
        if (coupon.getMinOrderAmount() != null && orderAmount < coupon.getMinOrderAmount()) {
            return CouponValidationResponse.invalid(cleanCode,
                    "Minimum order amount of ₹" + String.format("%.2f", coupon.getMinOrderAmount())
                            + " is required to apply this coupon. Your cart total is ₹" + String.format("%.2f", orderAmount));
        }

        // 5. Check Global Usage Limit
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return CouponValidationResponse.invalid(cleanCode, "Coupon '" + cleanCode + "' maximum usage limit has been reached.");
        }

        // 6. Check Per-User Usage Limit
        if (userId != null && coupon.getUserUsageLimit() != null) {
            long userUsageCount = couponUsageRepository.countByCouponIdAndUserId(coupon.getId(), userId);
            if (userUsageCount >= coupon.getUserUsageLimit()) {
                return CouponValidationResponse.invalid(cleanCode,
                        "You have already redeemed coupon '" + cleanCode + "' the maximum allowed times ("
                                + coupon.getUserUsageLimit() + ").");
            }
        }

        // 7. Calculate Discount
        double rawDiscount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            rawDiscount = orderAmount * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && rawDiscount > coupon.getMaxDiscountAmount()) {
                rawDiscount = coupon.getMaxDiscountAmount();
            }
        } else {
            rawDiscount = Math.min(coupon.getDiscountValue(), orderAmount);
        }

        double discountAmount = Math.round(rawDiscount * 100.0) / 100.0;
        double finalAmount = Math.max(0.0, Math.round((orderAmount - discountAmount) * 100.0) / 100.0);

        String successMsg;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            successMsg = String.format("Coupon '%s' applied! Saved %.0f%% (₹%.2f)", cleanCode, coupon.getDiscountValue(), discountAmount);
        } else {
            successMsg = String.format("Coupon '%s' applied! Saved flat ₹%.2f", cleanCode, discountAmount);
        }

        return CouponValidationResponse.valid(
                cleanCode,
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                discountAmount,
                orderAmount,
                finalAmount,
                coupon.getMinOrderAmount(),
                coupon.getMaxDiscountAmount(),
                successMsg
        );
    }

    /**
     * Record coupon redemption during order confirmation.
     */
    @Transactional
    public void recordCouponUsage(String couponCode, Order order, User customer, Double orderAmount, Double discountAmount, Double finalAmount) {
        if (couponCode == null || couponCode.isBlank() || discountAmount == null || discountAmount <= 0) {
            return;
        }

        String cleanCode = couponCode.trim().toUpperCase();
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(cleanCode);

        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setUsageCount((coupon.getUsageCount() != null ? coupon.getUsageCount() : 0) + 1);
            couponRepository.save(coupon);

            CouponUsage usage = CouponUsage.builder()
                    .coupon(coupon)
                    .user(customer)
                    .order(order)
                    .orderAmount(orderAmount)
                    .discountAmount(discountAmount)
                    .finalAmount(finalAmount)
                    .usedAt(LocalDateTime.now())
                    .build();

            couponUsageRepository.save(usage);
        }
    }

    @Transactional
    public CouponResponse createCoupon(CouponRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();

        if (couponRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("Coupon with code '" + cleanCode + "' already exists.");
        }

        Coupon coupon = Coupon.builder()
                .code(cleanCode)
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getStartDate())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .userUsageLimit(request.getUserUsageLimit() != null ? request.getUserUsageLimit() : 1)
                .usageCount(0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Coupon saved = couponRepository.save(coupon);
        return mapToResponse(saved);
    }

    @Transactional
    public CouponResponse updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with ID: " + id));

        String cleanCode = request.getCode().trim().toUpperCase();
        if (!coupon.getCode().equalsIgnoreCase(cleanCode) && couponRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("Another coupon with code '" + cleanCode + "' already exists.");
        }

        coupon.setCode(cleanCode);
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getUserUsageLimit() != null) {
            coupon.setUserUsageLimit(request.getUserUsageLimit());
        }
        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }

        Coupon updated = couponRepository.save(coupon);
        return mapToResponse(updated);
    }

    @Transactional
    public CouponResponse toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with ID: " + id));

        coupon.setActive(!Boolean.TRUE.equals(coupon.getActive()));
        Coupon updated = couponRepository.save(coupon);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    public List<CouponResponse> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CouponResponse> getActiveCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(c -> c.getExpiryDate() == null || !now.isAfter(c.getExpiryDate()))
                .filter(c -> c.getStartDate() == null || !now.isBefore(c.getStartDate()))
                .filter(c -> c.getUsageLimit() == null || c.getUsageCount() < c.getUsageLimit())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CouponResponse getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with ID: " + id));
        return mapToResponse(coupon);
    }

    public CouponAnalyticsSummary getCouponAnalytics() {
        List<Coupon> allCoupons = couponRepository.findAll();
        List<CouponUsage> allUsages = couponUsageRepository.findAll();

        LocalDateTime now = LocalDateTime.now();
        long activeCount = allCoupons.stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .filter(c -> c.getExpiryDate() == null || !now.isAfter(c.getExpiryDate()))
                .count();

        long totalRedemptions = allUsages.size();
        double totalDiscounts = allUsages.stream()
                .mapToDouble(u -> u.getDiscountAmount() != null ? u.getDiscountAmount() : 0.0)
                .sum();

        double avgDiscount = totalRedemptions > 0 ? (totalDiscounts / totalRedemptions) : 0.0;

        // Group usages by coupon ID to get top performers
        Map<Long, List<CouponUsage>> byCoupon = allUsages.stream()
                .filter(u -> u.getCoupon() != null)
                .collect(Collectors.groupingBy(u -> u.getCoupon().getId()));

        List<CouponAnalyticsSummary.TopCouponMetric> topList = allCoupons.stream()
                .map(c -> {
                    List<CouponUsage> usages = byCoupon.getOrDefault(c.getId(), Collections.emptyList());
                    long count = usages.size();
                    double discountSum = usages.stream().mapToDouble(u -> u.getDiscountAmount() != null ? u.getDiscountAmount() : 0.0).sum();
                    return new CouponAnalyticsSummary.TopCouponMetric(
                            c.getId(),
                            c.getCode(),
                            c.getDiscountType().name(),
                            c.getDiscountValue(),
                            count,
                            Math.round(discountSum * 100.0) / 100.0
                    );
                })
                .sorted((a, b) -> Long.compare(b.getUsageCount(), a.getUsageCount()))
                .limit(5)
                .collect(Collectors.toList());

        CouponAnalyticsSummary summary = new CouponAnalyticsSummary();
        summary.setTotalCoupons(allCoupons.size());
        summary.setActiveCoupons(activeCount);
        summary.setTotalRedemptions(totalRedemptions);
        summary.setTotalDiscountsGiven(Math.round(totalDiscounts * 100.0) / 100.0);
        summary.setAverageDiscountPerRedemption(Math.round(avgDiscount * 100.0) / 100.0);
        summary.setTopPerformingCoupons(topList);

        return summary;
    }

    public List<CouponUsageResponse> getAllUsageLogs() {
        return couponUsageRepository.findAllByOrderByUsedAtDesc().stream()
                .map(u -> {
                    CouponUsageResponse res = new CouponUsageResponse();
                    res.setId(u.getId());
                    if (u.getCoupon() != null) {
                        res.setCouponId(u.getCoupon().getId());
                        res.setCouponCode(u.getCoupon().getCode());
                    }
                    if (u.getUser() != null) {
                        res.setCustomerId(u.getUser().getId());
                        res.setCustomerName(u.getUser().getFullName());
                        res.setCustomerEmail(u.getUser().getEmail());
                    }
                    if (u.getOrder() != null) {
                        res.setOrderId(u.getOrder().getId());
                        res.setOrderNumber(u.getOrder().getOrderNumber());
                    }
                    res.setOrderAmount(u.getOrderAmount());
                    res.setDiscountAmount(u.getDiscountAmount());
                    res.setFinalAmount(u.getFinalAmount());
                    res.setUsedAt(u.getUsedAt());
                    return res;
                })
                .collect(Collectors.toList());
    }

    private CouponResponse mapToResponse(Coupon coupon) {
        CouponResponse res = new CouponResponse();
        res.setId(coupon.getId());
        res.setCode(coupon.getCode());
        res.setDescription(coupon.getDescription());
        res.setDiscountType(coupon.getDiscountType());
        res.setDiscountValue(coupon.getDiscountValue());
        res.setMinOrderAmount(coupon.getMinOrderAmount());
        res.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
        res.setStartDate(coupon.getStartDate());
        res.setExpiryDate(coupon.getExpiryDate());
        res.setUsageLimit(coupon.getUsageLimit());
        res.setUserUsageLimit(coupon.getUserUsageLimit());
        res.setUsageCount(coupon.getUsageCount() != null ? coupon.getUsageCount() : 0);
        res.setActive(coupon.getActive());

        boolean isExpired = coupon.getExpiryDate() != null && LocalDateTime.now().isAfter(coupon.getExpiryDate());
        res.setIsExpired(isExpired);

        res.setCreatedAt(coupon.getCreatedAt());
        res.setUpdatedAt(coupon.getUpdatedAt());
        return res;
    }
}
