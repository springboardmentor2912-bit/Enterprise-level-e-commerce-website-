package com.javaenterprise.coupon.controller;

import com.javaenterprise.coupon.dto.CouponValidationResponse;
import com.javaenterprise.coupon.entity.Coupon;
import com.javaenterprise.coupon.repository.CouponRepository;
import com.javaenterprise.coupon.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/customer/coupons")
@RequiredArgsConstructor
public class CustomerCouponController {

    private final CouponService couponService;
    private final CouponRepository couponRepository;

    @GetMapping("/validate")
    public CouponValidationResponse validate(@RequestParam String code,
                                             @RequestParam BigDecimal orderTotal) {
        return couponService.validate(code, orderTotal);
    }

    // 🆕 CHANGED from "/public/coupons" to "/active"
    // This makes the final URL: /api/customer/coupons/active
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCoupons() {
        List<Coupon> activeCoupons = couponRepository.findAll();
        return ResponseEntity.ok(activeCoupons);
    }
}