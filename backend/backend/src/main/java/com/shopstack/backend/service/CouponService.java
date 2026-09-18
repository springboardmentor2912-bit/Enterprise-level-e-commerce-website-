package com.shopstack.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.repository.CouponRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;

    public record CouponCalculation(String code, double discount, double total) {}

    public CouponCalculation calculate(String code, double subtotal) {
        if (code == null || code.isBlank()) return new CouponCalculation(null, 0, subtotal);
        Coupon coupon = getValid(code, subtotal);
        double discount = "PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())
                ? subtotal * coupon.getDiscountValue() / 100.0 : coupon.getDiscountValue();
        if (coupon.getMaximumDiscount() != null && coupon.getMaximumDiscount() >= 0) {
            discount = Math.min(discount, coupon.getMaximumDiscount());
        }
        discount = Math.max(0, Math.min(discount, subtotal));
        return new CouponCalculation(coupon.getCode(), discount, subtotal - discount);
    }

    @Transactional
    public CouponCalculation calculateAndConsume(String code, double subtotal) {
        CouponCalculation result = calculate(code, subtotal);
        if (result.code() != null) {
            Coupon coupon = couponRepository.findByCodeIgnoreCase(result.code()).orElseThrow();
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);
        }
        return result;
    }

    private Coupon getValid(String code, double subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Coupon code is invalid."));
        LocalDateTime now = LocalDateTime.now();
        if (!coupon.isActive()) throw new IllegalArgumentException("This coupon is inactive.");
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) throw new IllegalArgumentException("This coupon is not active yet.");
        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) throw new IllegalArgumentException("This coupon has expired.");
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) throw new IllegalArgumentException("This coupon has reached its usage limit.");
        if (coupon.getMinimumOrderAmount() != null && subtotal < coupon.getMinimumOrderAmount()) throw new IllegalArgumentException("Minimum order amount is ₹" + coupon.getMinimumOrderAmount() + ".");
        return coupon;
    }
}
