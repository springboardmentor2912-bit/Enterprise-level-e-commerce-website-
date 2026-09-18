package com.shopstack.service;

import com.shopstack.dto.*;
import java.math.BigDecimal;
import java.util.List;

public interface CouponService {

    CouponDTO createCoupon(CreateCouponRequest request);

    CouponDTO updateCoupon(Long id, CreateCouponRequest request);

    void deleteCoupon(Long id);

    CouponDTO toggleCouponStatus(Long id);

    CouponDTO getCouponById(Long id);

    CouponDTO getCouponByCode(String code);

    List<CouponDTO> getAllCoupons();

    List<CouponDTO> getActivePublicCoupons();

    ApplyCouponResponse validateAndCalculateDiscount(String code, BigDecimal cartTotal, String customerEmail);

    CouponAnalyticsDTO getCouponAnalytics();
}
