package com.shopstack.backend.controller;

import com.shopstack.backend.dto.ApplyCouponRequest;
import com.shopstack.backend.dto.CouponApplyResponse;
import com.shopstack.backend.dto.CouponResponse;
import com.shopstack.backend.dto.CreateCouponRequest;
import com.shopstack.backend.service.CouponService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }


    // =========================================================
    // ADMIN - CREATE COUPON
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createCoupon(
            @RequestBody CreateCouponRequest request
    ) {

        try {

            CouponResponse response =
                    couponService.createCoupon(request);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // ADMIN - GET ALL COUPONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {

        System.out.println("🔥 GET ALL COUPONS CONTROLLER CALLED");

        return ResponseEntity.ok(
                couponService.getAllCoupons()
        );
    }


    // =========================================================
    // ADMIN - GET COUPON BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                couponService.getCouponById(id)
        );
    }


    // =========================================================
    // CUSTOMER - APPLY COUPON
    // =========================================================

    @PostMapping("/apply")
    public ResponseEntity<?> applyCoupon(
            @RequestBody ApplyCouponRequest request,
            Authentication authentication
    ) {

        try {

            CouponApplyResponse response =
                    couponService.applyCoupon(
                            request,
                            authentication.getName()
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/vendor")
    public ResponseEntity<List<CouponResponse>> getVendorCoupons(
            Authentication authentication
    ) {
        System.out.println("🔥 VENDOR COUPON CONTROLLER REACHED");
        System.out.println("User: " + authentication.getName());
        System.out.println("Authorities: " + authentication.getAuthorities());
        return ResponseEntity.ok(
                couponService.getVendorCoupons(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<CouponResponse> approveCoupon(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                couponService.approveCoupon(
                        id,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<CouponResponse> rejectCoupon(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                couponService.rejectCoupon(
                        id,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/available")
    public ResponseEntity<List<CouponResponse>> getAvailableCoupons(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                couponService.getAvailableCoupons(
                        authentication.getName()
                )
        );
    }

    // =========================================================
// ADMIN - ACTIVATE / DEACTIVATE COUPON
// =========================================================

    @PutMapping("/{id}/toggle")
    public ResponseEntity<CouponResponse> toggleCoupon(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                couponService.toggleCoupon(id)
        );
    }
}