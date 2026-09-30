package com.shopstack.backend.controller;

import com.shopstack.backend.model.Coupon;
import com.shopstack.backend.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @GetMapping
    public ResponseEntity<?> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            return ResponseEntity.ok(couponService.createCoupon(coupon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        try {
            return ResponseEntity.ok(couponService.updateCoupon(id, coupon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleActiveStatus(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(couponService.toggleActiveStatus(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok("Coupon deleted successfully");
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> payload) {
        try {
            String code = payload.containsKey("code") ? payload.get("code").toString() : "";
            Long userId = payload.containsKey("userId") && payload.get("userId") != null 
                    ? Long.parseLong(payload.get("userId").toString()) : null;
            List<Map<String, Object>> items = payload.containsKey("items") 
                    ? (List<Map<String, Object>>) payload.get("items") : null;

            Map<String, Object> result = couponService.validateAndCalculateDiscount(code, items, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Validation failed: " + e.getMessage());
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getCouponAnalytics() {
        return ResponseEntity.ok(couponService.getCouponAnalytics());
    }

    @GetMapping("/approvals")
    public ResponseEntity<?> getAllApprovals() {
        return ResponseEntity.ok(couponService.getAllApprovals());
    }

    @GetMapping("/mappings")
    public ResponseEntity<?> getAllMappings() {
        return ResponseEntity.ok(couponService.getAllMappings());
    }

    @GetMapping("/{code}/products")
    public ResponseEntity<?> getProductIdsForCoupon(@PathVariable String code) {
        return ResponseEntity.ok(couponService.getProductIdsForCoupon(code));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<?> getVendorCoupons(@PathVariable Long vendorId) {
        return ResponseEntity.ok(couponService.getVendorCoupons(vendorId));
    }

    @PostMapping("/vendor/{vendorId}/approve")
    public ResponseEntity<?> approveCoupon(@PathVariable Long vendorId, @RequestBody Map<String, Object> payload) {
        try {
            String couponCode = payload.get("couponCode") != null ? payload.get("couponCode").toString() : null;
            if (couponCode == null) {
                return ResponseEntity.badRequest().body("couponCode is required");
            }
            boolean applyToAll = !payload.containsKey("applyToAll") || Boolean.parseBoolean(payload.get("applyToAll").toString());
            List<Long> productIds = new java.util.ArrayList<>();
            if (payload.containsKey("productIds") && payload.get("productIds") instanceof List) {
                List<?> list = (List<?>) payload.get("productIds");
                for (Object o : list) {
                    productIds.add(Long.parseLong(o.toString()));
                }
            }
            return ResponseEntity.ok(couponService.setVendorCouponStatusWithProducts(vendorId, couponCode, "APPROVED", applyToAll, productIds));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/vendor/{vendorId}/reject")
    public ResponseEntity<?> rejectCoupon(@PathVariable Long vendorId, @RequestBody Map<String, String> payload) {
        try {
            String couponCode = payload.get("couponCode");
            if (couponCode == null) {
                return ResponseEntity.badRequest().body("couponCode is required");
            }
            return ResponseEntity.ok(couponService.setVendorCouponStatus(vendorId, couponCode, "REJECTED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
