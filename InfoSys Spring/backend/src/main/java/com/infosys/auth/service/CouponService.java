package com.infosys.auth.service;

import com.infosys.auth.model.Coupon;
import com.infosys.auth.model.CouponUsage;
import com.infosys.auth.repository.CouponRepository;
import com.infosys.auth.repository.CouponUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;

    public CouponService(CouponRepository couponRepository, CouponUsageRepository couponUsageRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc();
    }

    public Coupon getCouponById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with ID: " + id));
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (coupon.getCode() == null || coupon.getCode().trim().isEmpty()) {
            throw new RuntimeException("Coupon code is required");
        }
        String normalizedCode = coupon.getCode().trim().toUpperCase();
        if (couponRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new RuntimeException("Coupon code '" + normalizedCode + "' already exists");
        }
        coupon.setCode(normalizedCode);
        if (coupon.getDiscountType() == null) {
            coupon.setDiscountType("PERCENTAGE");
        }
        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }
        if (coupon.getActive() == null) {
            coupon.setActive(true);
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon details) {
        Coupon existing = getCouponById(id);

        if (details.getCode() != null && !details.getCode().equalsIgnoreCase(existing.getCode())) {
            String newCode = details.getCode().trim().toUpperCase();
            if (couponRepository.existsByCodeIgnoreCase(newCode)) {
                throw new RuntimeException("Coupon code '" + newCode + "' already exists");
            }
            existing.setCode(newCode);
        }

        if (details.getDescription() != null) existing.setDescription(details.getDescription());
        if (details.getDiscountType() != null) existing.setDiscountType(details.getDiscountType().toUpperCase());
        if (details.getDiscountValue() != null) existing.setDiscountValue(details.getDiscountValue());
        if (details.getMinOrderAmount() != null) existing.setMinOrderAmount(details.getMinOrderAmount());
        if (details.getMaxDiscountAmount() != null) existing.setMaxDiscountAmount(details.getMaxDiscountAmount());
        if (details.getStartDate() != null) existing.setStartDate(details.getStartDate());
        if (details.getExpiryDate() != null) existing.setExpiryDate(details.getExpiryDate());
        if (details.getUsageLimit() != null) existing.setUsageLimit(details.getUsageLimit());
        if (details.getActive() != null) existing.setActive(details.getActive());

        return couponRepository.save(existing);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Transactional
    public Coupon toggleCouponStatus(Long id) {
        Coupon coupon = getCouponById(id);
        coupon.setActive(!Boolean.TRUE.equals(coupon.getActive()));
        return couponRepository.save(coupon);
    }

    /**
     * Validates coupon eligibility against current cart amount and calculates exact discount.
     */
    public Map<String, Object> validateAndCalculateDiscount(String code, BigDecimal cartAmount) {
        if (code == null || code.trim().isEmpty()) {
            throw new RuntimeException("Coupon code is required");
        }
        if (cartAmount == null || cartAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Cart amount must be greater than zero to apply coupon");
        }

        String normalizedCode = code.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new RuntimeException("Coupon code '" + normalizedCode + "' does not exist"));

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new RuntimeException("Coupon '" + normalizedCode + "' is currently inactive");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new RuntimeException("Coupon '" + normalizedCode + "' is not active yet");
        }
        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            throw new RuntimeException("Coupon '" + normalizedCode + "' has expired");
        }

        if (coupon.getMinOrderAmount() != null && cartAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new RuntimeException("Minimum order amount of ₹" + coupon.getMinOrderAmount() +
                    " is required for coupon '" + normalizedCode + "' (Current cart: ₹" + cartAmount + ")");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon '" + normalizedCode + "' has reached its maximum usage limit");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        String type = coupon.getDiscountType() != null ? coupon.getDiscountType().toUpperCase() : "PERCENTAGE";

        if ("PERCENTAGE".equalsIgnoreCase(type)) {
            BigDecimal percent = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
            BigDecimal rawDiscount = cartAmount.multiply(percent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && rawDiscount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discountAmount = coupon.getMaxDiscountAmount();
            } else {
                discountAmount = rawDiscount;
            }
        } else if ("FLAT_AMOUNT".equalsIgnoreCase(type)) {
            BigDecimal flat = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : BigDecimal.ZERO;
            discountAmount = flat.min(cartAmount).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal finalAmount = cartAmount.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("valid", true);
        result.put("couponId", coupon.getId());
        result.put("couponCode", coupon.getCode());
        result.put("discountType", type);
        result.put("discountValue", coupon.getDiscountValue());
        result.put("cartAmount", cartAmount);
        result.put("discountAmount", discountAmount);
        result.put("finalAmount", finalAmount);
        result.put("message", "Coupon '" + coupon.getCode() + "' applied! You saved ₹" + discountAmount);
        return result;
    }

    /**
     * Records a successful coupon redemption and increments usage count.
     */
    @Transactional
    public CouponUsage recordCouponUsage(String code, Long userId, String customerName, Long orderId,
                                         BigDecimal cartAmount, BigDecimal discountAmount, BigDecimal finalAmount) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        String normalizedCode = code.trim().toUpperCase();
        Optional<Coupon> cOpt = couponRepository.findByCodeIgnoreCase(normalizedCode);
        if (cOpt.isEmpty()) {
            return null;
        }

        Coupon coupon = cOpt.get();
        coupon.setUsedCount((coupon.getUsedCount() != null ? coupon.getUsedCount() : 0) + 1);
        couponRepository.save(coupon);

        CouponUsage usage = new CouponUsage(
                coupon.getId(),
                coupon.getCode(),
                userId,
                customerName != null ? customerName : "Customer #" + userId,
                orderId,
                cartAmount,
                discountAmount,
                finalAmount
        );

        return couponUsageRepository.save(usage);
    }

    /**
     * Analytics and breakdown report for Admin Dashboard.
     */
    public Map<String, Object> getCouponAnalytics() {
        List<Coupon> allCoupons = couponRepository.findAllByOrderByCreatedAtDesc();
        List<CouponUsage> usageHistory = couponUsageRepository.findAllByOrderByUsedAtDesc();

        long activeCouponsCount = allCoupons.stream().filter(c -> Boolean.TRUE.equals(c.getActive())).count();
        long totalRedemptions = usageHistory.size();

        BigDecimal totalDiscountGiven = usageHistory.stream()
                .map(CouponUsage::getDiscountAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalCoupons", allCoupons.size());
        result.put("activeCoupons", activeCouponsCount);
        result.put("totalRedemptions", totalRedemptions);
        result.put("totalUsageCount", totalRedemptions);
        result.put("totalDiscountGiven", totalDiscountGiven);
        result.put("allCoupons", allCoupons);
        result.put("usageHistory", usageHistory);
        return result;
    }
}
