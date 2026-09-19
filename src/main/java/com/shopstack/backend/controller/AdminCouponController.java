package com.shopstack.backend.controller;

import com.shopstack.backend.dto.CouponAnalyticsResponse;
import com.shopstack.backend.dto.CouponResponse;
import com.shopstack.backend.dto.CreateCouponRequest;
import com.shopstack.backend.service.CouponAnalyticsService;
import com.shopstack.backend.service.CouponService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

    private final CouponService couponService;

    private final CouponAnalyticsService
            couponAnalyticsService;


    public AdminCouponController(
            CouponService couponService,
            CouponAnalyticsService couponAnalyticsService
    ) {

        this.couponService =
                couponService;

        this.couponAnalyticsService =
                couponAnalyticsService;
    }


    // =========================================================
    // CREATE COUPON
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createCoupon(
            @RequestBody CreateCouponRequest request
    ) {

        try {

            CouponResponse response =
                    couponService.createCoupon(
                            request
                    );

            return ResponseEntity.ok(
                    response
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET ALL COUPONS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllCoupons() {

        try {

            List<CouponResponse> coupons =
                    couponService.getAllCoupons();

            return ResponseEntity.ok(
                    coupons
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getCouponById(
            @PathVariable Long id
    ) {

        try {

            CouponResponse coupon =
                    couponService.getCouponById(
                            id
                    );

            return ResponseEntity.ok(
                    coupon
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // COUPON ANALYTICS
    // =========================================================

    @GetMapping("/analytics")
    public ResponseEntity<?> getCouponAnalytics() {

        try {

            List<CouponAnalyticsResponse>
                    analytics =
                    couponAnalyticsService
                            .getAllCouponAnalytics();

            return ResponseEntity.ok(
                    analytics
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // SINGLE COUPON ANALYTICS
    // =========================================================

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getSingleCouponAnalytics(
            @PathVariable Long id
    ) {

        try {

            CouponAnalyticsResponse analytics =
                    couponAnalyticsService
                            .getCouponAnalytics(id);

            return ResponseEntity.ok(
                    analytics
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}