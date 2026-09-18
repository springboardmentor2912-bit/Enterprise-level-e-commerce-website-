package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /**
     * Customer Checkout Endpoint: Validate coupon and calculate discount.
     */
    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validateCoupon(@Valid @RequestBody CouponValidationRequest request) {
        CouponValidationResponse response = couponService.validateCoupon(
                request.getCouponCode(),
                request.getOrderAmount(),
                request.getUserId()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Public / Customer Endpoint: Get active promotional offers.
     */
    @GetMapping("/active")
    public ResponseEntity<List<CouponResponse>> getActiveCoupons() {
        return ResponseEntity.ok(couponService.getActiveCoupons());
    }

    /**
     * Admin: Get all coupons.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    /**
     * Admin: Get coupon by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponById(id));
    }

    /**
     * Admin: Create new coupon.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        CouponResponse created = couponService.createCoupon(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Admin: Update coupon details.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(couponService.updateCoupon(id, request));
    }

    /**
     * Admin: Toggle Active/Inactive status.
     */
    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponResponse> toggleCouponStatus(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleCouponStatus(id));
    }

    /**
     * Admin: Delete coupon.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin: Coupon analytics and top performers.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponAnalyticsSummary> getCouponAnalytics() {
        return ResponseEntity.ok(couponService.getCouponAnalytics());
    }

    /**
     * Admin: Redemption usage audit ledger.
     */
    @GetMapping("/usage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponUsageResponse>> getCouponUsageLogs() {
        return ResponseEntity.ok(couponService.getAllUsageLogs());
    }
}
