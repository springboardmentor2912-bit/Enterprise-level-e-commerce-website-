package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.CouponRequest;
import com.shopstack.shopstack_backend.dto.response.CouponResponse;

import java.util.List;

public interface CouponService {

    CouponResponse createCoupon(CouponRequest request);

    List<CouponResponse> getAllCoupons();

    CouponResponse getCouponByCode(String code);

    CouponResponse updateCouponStatus(Long id, boolean active);
}