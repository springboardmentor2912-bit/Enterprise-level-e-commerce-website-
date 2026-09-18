package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/admin/coupons")
public class AdminCouponController {

    private final CouponService couponService;

    public AdminCouponController(
            CouponService couponService) {

        this.couponService = couponService;
    }

    // CREATE COUPON
    @PostMapping
    public ResponseEntity<CouponResponse> createCoupon(
            @Valid @RequestBody CouponRequest request) {

        CouponResponse response =
                couponService.createCoupon(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL COUPONS
    @GetMapping
    public ResponseEntity<List<CouponResponse>> getAllCoupons() {

        return ResponseEntity.ok(
                couponService.getAllCoupons()
        );
    }

    // GET COUPON BY ID
    @GetMapping("/{id}")
    public ResponseEntity<CouponResponse> getCouponById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                couponService.getCouponById(id)
        );
    }

    // UPDATE COUPON
    @PutMapping("/{id}")
    public ResponseEntity<CouponResponse> updateCoupon(
            @PathVariable Long id,
            @Valid @RequestBody CouponRequest request) {

        return ResponseEntity.ok(
                couponService.updateCoupon(
                        id,
                        request
                )
        );
    }

    // ACTIVATE / DEACTIVATE COUPON
    @PutMapping("/{id}/toggle")
    public ResponseEntity<CouponResponse> toggleCoupon(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                couponService.toggleCoupon(id)
        );
    }

    // DELETE COUPON
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCoupon(
            @PathVariable Long id) {

        couponService.deleteCoupon(id);

        return ResponseEntity.ok(
                "Coupon deleted successfully"
        );
    }
}