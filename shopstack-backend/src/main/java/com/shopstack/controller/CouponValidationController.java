package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Lets a logged-in customer preview a coupon's discount on the checkout page
 * before actually placing the order. Separate from the admin-only
 * CouponController's CRUD endpoints.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponValidationController {

    private final CouponService couponService;

    @GetMapping("/validate")
    public ApiResponse<?> validate(@RequestParam String code, @RequestParam BigDecimal subtotal) {
        return ApiResponse.ok(couponService.validateAndCompute(code, subtotal));
    }
}
