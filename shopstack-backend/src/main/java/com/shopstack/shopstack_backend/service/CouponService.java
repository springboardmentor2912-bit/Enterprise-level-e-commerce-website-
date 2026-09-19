
package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.entity.Coupon;
import com.shopstack.shopstack_backend.entity.DiscountType;
import com.shopstack.shopstack_backend.repository.CouponRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }


    // =====================================================
    // CALCULATE DISCOUNT
    // =====================================================

    public double calculateDiscount(
            String couponCode,
            double orderAmount) {

        if (couponCode == null ||
                couponCode.isBlank()) {

            throw new RuntimeException(
                    "Coupon code is required"
            );
        }


        if (orderAmount <= 0) {

            throw new RuntimeException(
                    "Order amount must be greater than zero"
            );
        }


        String normalizedCode =
                couponCode
                        .trim()
                        .toUpperCase();


        // Find coupon
        Coupon coupon =
                couponRepository
                        .findByCodeIgnoreCase(
                                normalizedCode
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid coupon code"
                                )
                        );


        // Validate coupon
        validateCoupon(
                coupon,
                orderAmount
        );


        double discount;


        // =================================================
        // PERCENTAGE DISCOUNT
        // =================================================

        if (coupon.getDiscountType()
                == DiscountType.PERCENTAGE) {

            discount =
                    orderAmount
                            * coupon.getDiscountValue()
                            / 100.0;


            // Maximum discount
            if (coupon.getMaximumDiscount()
                    != null) {

                discount =
                        Math.min(
                                discount,
                                coupon.getMaximumDiscount()
                        );
            }

        }

        // =================================================
        // FIXED DISCOUNT
        // =================================================

        else {

            discount =
                    coupon.getDiscountValue();
        }


        // Discount cannot exceed order amount
        discount =
                Math.min(
                        discount,
                        orderAmount
                );


        // Prevent negative discount
        discount =
                Math.max(
                        discount,
                        0
                );


        return Math.round(
                discount * 100.0
        ) / 100.0;
    }


    // =====================================================
    // VALIDATE COUPON
    // =====================================================

    private void validateCoupon(
            Coupon coupon,
            double orderAmount) {


        // Active check
        if (!coupon.isActive()) {

            throw new RuntimeException(
                    "Coupon is inactive"
            );
        }


        // Date validation
        LocalDateTime now =
                LocalDateTime.now();


        if (coupon.getStartDate() != null &&
                now.isBefore(
                        coupon.getStartDate()
                )) {

            throw new RuntimeException(
                    "Coupon is not active yet"
            );
        }


        if (coupon.getEndDate() != null &&
                now.isAfter(
                        coupon.getEndDate()
                )) {

            throw new RuntimeException(
                    "Coupon has expired"
            );
        }


        // Minimum order amount
        if (orderAmount <
                coupon.getMinimumOrderAmount()) {

            throw new RuntimeException(
                    "Minimum order amount is ₹"
                            + coupon.getMinimumOrderAmount()
            );
        }


        // Usage limit
        int usedCount =
                coupon.getUsedCount() == null
                        ? 0
                        : coupon.getUsedCount();


        if (coupon.getUsageLimit() != null &&
                usedCount >=
                        coupon.getUsageLimit()) {

            throw new RuntimeException(
                    "Coupon usage limit reached"
            );
        }
    }


    // =====================================================
    // INCREMENT USAGE
    // =====================================================

    @Transactional
    public void incrementUsage(
            String couponCode) {

        if (couponCode == null ||
                couponCode.isBlank()) {

            return;
        }


        String normalizedCode =
                couponCode
                        .trim()
                        .toUpperCase();


        Coupon coupon =
                couponRepository
                        .findByCodeIgnoreCase(
                                normalizedCode
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );


        int currentUsedCount =
                coupon.getUsedCount() == null
                        ? 0
                        : coupon.getUsedCount();


        coupon.setUsedCount(
                currentUsedCount + 1
        );


        couponRepository.save(coupon);
    }
}

