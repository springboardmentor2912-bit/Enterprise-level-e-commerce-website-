package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.CouponRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.CouponResponse;
import com.shopstack.shopstack_backend.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
@PreAuthorize("hasRole('ADMIN')")
public class CouponController {

    private final CouponService couponService;

    public CouponController(
            CouponService couponService) {

        this.couponService = couponService;
    }

    // =========================
    // CREATE COUPON
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<CouponResponse>>
    createCoupon(
            @Valid @RequestBody CouponRequest request) {

        System.out.println(
                "===== CREATE COUPON API HIT ====="
        );

        CouponResponse response =
                couponService.createCoupon(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon Created Successfully",
                        response
                )
        );
    }

    // =========================
    // GET ALL COUPONS
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<CouponResponse>>>
    getAllCoupons() {

        System.out.println(
                "===== GET ALL COUPONS API HIT ====="
        );

        List<CouponResponse> coupons =
                couponService.getAllCoupons();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupons Retrieved Successfully",
                        coupons
                )
        );
    }

    // =========================
    // GET COUPON BY CODE
    // =========================

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<CouponResponse>>
    getCouponByCode(
            @PathVariable String code) {

        System.out.println(
                "===== GET COUPON BY CODE API HIT ====="
        );

        CouponResponse response =
                couponService.getCouponByCode(code);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // ACTIVATE / DEACTIVATE
    // =========================

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CouponResponse>>
    updateCouponStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        System.out.println(
                "===== UPDATE COUPON STATUS API HIT ====="
        );

        CouponResponse response =
                couponService.updateCouponStatus(
                        id,
                        active
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Coupon Status Updated Successfully",
                        response
                )
        );
    }
}