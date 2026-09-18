package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.CouponRequest;
import com.shopstack.shopstack_backend.dto.response.CouponResponse;
import com.shopstack.shopstack_backend.entity.Coupon;
import com.shopstack.shopstack_backend.repository.CouponRepository;
import com.shopstack.shopstack_backend.service.CouponService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    public CouponServiceImpl(
            CouponRepository couponRepository) {

        this.couponRepository = couponRepository;
    }

    @Override
    public CouponResponse createCoupon(
            CouponRequest request) {

        if (couponRepository.existsByCode(
                request.getCode())) {

            throw new RuntimeException(
                    "Coupon code already exists"
            );
        }

        if (request.getExpiryDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "Expiry date must be after start date"
            );
        }

        Coupon coupon = new Coupon();

        coupon.setCode(
                request.getCode().toUpperCase()
        );

        coupon.setDescription(
                request.getDescription()
        );

        coupon.setDiscountPercentage(
                request.getDiscountPercentage()
        );

        coupon.setMinimumOrderAmount(
                request.getMinimumOrderAmount()
        );

        coupon.setStartDate(
                request.getStartDate()
        );

        coupon.setExpiryDate(
                request.getExpiryDate()
        );

        coupon.setUsageLimit(
                request.getUsageLimit()
        );

        coupon.setUsedCount(0);

        coupon.setActive(true);

        Coupon savedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(savedCoupon);
    }

    @Override
    public List<CouponResponse> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Override
    public CouponResponse getCouponByCode(
            String code) {

        Coupon coupon =
                couponRepository.findByCode(
                                code.toUpperCase()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );

        return convertToResponse(coupon);
    }

    @Override
    public CouponResponse updateCouponStatus(
            Long id,
            boolean active) {

        Coupon coupon =
                couponRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );

        coupon.setActive(active);

        Coupon updatedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(updatedCoupon);
    }

    private CouponResponse convertToResponse(
            Coupon coupon) {

        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDescription(),
                coupon.getDiscountPercentage(),
                coupon.getMinimumOrderAmount(),
                coupon.getStartDate(),
                coupon.getExpiryDate(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.isActive()
        );
    }
}