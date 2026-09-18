package com.infosys.auth.controller;

import com.infosys.auth.model.Coupon;
import com.infosys.auth.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> updateCoupon(@PathVariable Long id, @RequestBody Coupon couponDetails) {
        return ResponseEntity.ok(couponService.updateCoupon(id, couponDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(Map.of("message", "Coupon deleted successfully"));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Coupon> toggleCouponStatus(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.toggleCouponStatus(id));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyCoupon(@RequestBody Map<String, Object> payload) {
        try {
            String code = payload.getOrDefault("code", "").toString();
            BigDecimal cartAmount = BigDecimal.ZERO;
            if (payload.containsKey("cartAmount") && payload.get("cartAmount") != null) {
                cartAmount = new BigDecimal(payload.get("cartAmount").toString());
            }

            Map<String, Object> calculation = couponService.validateAndCalculateDiscount(code, cartAmount);
            return ResponseEntity.ok(calculation);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "message", ex.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getCouponAnalytics() {
        return ResponseEntity.ok(couponService.getCouponAnalytics());
    }
}
