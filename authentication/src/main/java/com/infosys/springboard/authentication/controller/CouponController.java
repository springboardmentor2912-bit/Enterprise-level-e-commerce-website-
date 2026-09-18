package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.CouponRequest;
import com.infosys.springboard.authentication.dto.CouponResponse;
import com.infosys.springboard.authentication.service.CouponService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/coupons")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(
            @Valid @RequestBody CouponRequest request) {

        return ResponseEntity.ok(
                couponService.createCoupon(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {

        return ResponseEntity.ok(
                couponService.getAllCoupons()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                couponService.getCouponById(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {

        return ResponseEntity.ok(
                couponService.updateCoupon(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(
            @PathVariable Long id) {

        couponService.deleteCoupon(id);

        return ResponseEntity.ok("Coupon deleted successfully");
    }
}