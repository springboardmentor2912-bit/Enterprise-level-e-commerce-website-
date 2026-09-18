package com.shopstack.service;

import com.shopstack.dto.coupon.ApplyCouponResult;
import com.shopstack.dto.coupon.CouponRequest;
import com.shopstack.dto.coupon.CouponResponse;
import com.shopstack.entity.Coupon;
import com.shopstack.enums.DiscountType;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    @Transactional
    public Coupon create(CouponRequest request) {
        if (couponRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new BadRequestException("A coupon with this code already exists");
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .active(true)
                .build();
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon deactivate(Long id) {
        Coupon coupon = getById(id);
        coupon.setActive(false);
        return couponRepository.save(coupon);
    }

    public Coupon getById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
    }

    public Page<Coupon> getAll(Pageable pageable) {
        return couponRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Validates a coupon code against the given subtotal and returns the
     * discount amount to apply. Does NOT increment the usage counter — that
     * only happens once payment is actually confirmed (see markUsed), so an
     * abandoned checkout doesn't burn a customer's coupon usage.
     */
    public ApplyCouponResult validateAndCompute(String code, BigDecimal subtotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new BadRequestException("Invalid coupon code"));

        if (!coupon.isCurrentlyValid()) {
            throw new BadRequestException("This coupon is no longer valid");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException("This coupon requires a minimum order of ₹" + coupon.getMinOrderAmount());
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal; // never discount below zero
        }

        return ApplyCouponResult.builder().code(coupon.getCode()).discountAmount(discount).build();
    }

    @Transactional
    public void markUsed(String code) {
        couponRepository.findByCodeIgnoreCase(code).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    public CouponResponse toResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .validFrom(coupon.getValidFrom())
                .validTo(coupon.getValidTo())
                .active(coupon.isActive())
                .currentlyValid(coupon.isCurrentlyValid())
                .build();
    }
}
