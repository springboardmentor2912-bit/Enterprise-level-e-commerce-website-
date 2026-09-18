package com.infosys.springboard.authentication.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.CouponResponse;
import com.infosys.springboard.authentication.dto.CouponValidationResponse;
import com.infosys.springboard.authentication.service.CouponService;

@RestController
@RequestMapping("/customer/coupons")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerCouponController {

    private final CouponService couponService;

    public CustomerCouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    // =========================================================
    // GET ACTIVE COUPONS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<List<CouponResponse>> getActiveCoupons() {

        return ResponseEntity.ok(
                couponService.getActiveCouponsForCustomer()
        );
    }

    // =========================================================
    // VALIDATE / APPLY COUPON
    // =========================================================

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(
            @RequestParam String code,
            @RequestParam BigDecimal orderAmount) {

        return ResponseEntity.ok(
                couponService.validateCoupon(
                        code,
                        orderAmount
                )
        );
    }
}