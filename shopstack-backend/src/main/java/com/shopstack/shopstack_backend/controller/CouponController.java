
package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.Coupon;
import com.shopstack.shopstack_backend.repository.CouponRepository;
import com.shopstack.shopstack_backend.service.CouponService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/coupons")
@CrossOrigin(origins = "http://localhost:3000")
public class CouponController {

    private final CouponRepository couponRepository;
    private final CouponService couponService;

    public CouponController(
            CouponRepository couponRepository,
            CouponService couponService) {

        this.couponRepository = couponRepository;
        this.couponService = couponService;
    }


    // =====================================================
    // CREATE COUPON
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createCoupon(
            @RequestBody Coupon coupon) {

        try {

            if (coupon.getCode() == null ||
                    coupon.getCode().isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body("Coupon code is required");
            }

            String code =
                    coupon.getCode()
                            .trim()
                            .toUpperCase();

            if (couponRepository
                    .existsByCodeIgnoreCase(code)) {

                return ResponseEntity
                        .badRequest()
                        .body("Coupon code already exists");
            }

            coupon.setCode(code);

            if (coupon.getUsedCount() == null) {
                coupon.setUsedCount(0);
            }

            Coupon savedCoupon =
                    couponRepository.save(coupon);

            return ResponseEntity.ok(savedCoupon);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET ALL COUPONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {

        return ResponseEntity.ok(
                couponRepository.findAll()
        );
    }


    // =====================================================
    // GET COUPON BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getCoupon(
            @PathVariable Long id) {

        return couponRepository
                .findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity
                                .notFound()
                                .build()
                );
    }


    // =====================================================
    // VALIDATE COUPON
    // =====================================================

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(
            @RequestParam String code,
            @RequestParam double orderAmount) {

        try {

            // Normalize coupon code
            String normalizedCode =
                    code.trim().toUpperCase();

            // Validate amount
            if (orderAmount <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new CouponValidationResponse(
                                        false,
                                        normalizedCode,
                                        orderAmount,
                                        0,
                                        orderAmount,
                                        "Order amount must be greater than zero."
                                )
                        );
            }


            // Calculate discount
            double discount =
                    couponService.calculateDiscount(
                            normalizedCode,
                            orderAmount
                    );


            // Prevent discount from exceeding order amount
            if (discount > orderAmount) {
                discount = orderAmount;
            }

            if (discount < 0) {
                discount = 0;
            }


            double finalAmount =
                    orderAmount - discount;


            return ResponseEntity.ok(
                    new CouponValidationResponse(
                            true,
                            normalizedCode,
                            orderAmount,
                            discount,
                            finalAmount,
                            "Coupon applied successfully."
                    )
            );

        } catch (RuntimeException e) {

            String normalizedCode =
                    code == null
                            ? ""
                            : code.trim().toUpperCase();

            return ResponseEntity
                    .badRequest()
                    .body(
                            new CouponValidationResponse(
                                    false,
                                    normalizedCode,
                                    orderAmount,
                                    0,
                                    orderAmount,
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // UPDATE COUPON
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(
            @PathVariable Long id,
            @RequestBody Coupon updatedCoupon) {

        try {

            Coupon coupon =
                    couponRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Coupon not found"
                                    )
                            );


            coupon.setCode(
                    updatedCoupon.getCode()
                            .trim()
                            .toUpperCase()
            );

            coupon.setDescription(
                    updatedCoupon.getDescription()
            );

            coupon.setDiscountType(
                    updatedCoupon.getDiscountType()
            );

            coupon.setDiscountValue(
                    updatedCoupon.getDiscountValue()
            );

            coupon.setMinimumOrderAmount(
                    updatedCoupon.getMinimumOrderAmount()
            );

            coupon.setMaximumDiscount(
                    updatedCoupon.getMaximumDiscount()
            );

            coupon.setStartDate(
                    updatedCoupon.getStartDate()
            );

            coupon.setEndDate(
                    updatedCoupon.getEndDate()
            );

            coupon.setUsageLimit(
                    updatedCoupon.getUsageLimit()
            );

            coupon.setActive(
                    updatedCoupon.isActive()
            );


            return ResponseEntity.ok(
                    couponRepository.save(coupon)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // ACTIVATE / DEACTIVATE COUPON
    // =====================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateCouponStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        try {

            Coupon coupon =
                    couponRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Coupon not found"
                                    )
                            );


            coupon.setActive(active);


            return ResponseEntity.ok(
                    couponRepository.save(coupon)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // DELETE COUPON
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(
            @PathVariable Long id) {

        try {

            Coupon coupon =
                    couponRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Coupon not found"
                                    )
                            );


            couponRepository.delete(coupon);


            return ResponseEntity.ok(
                    "Coupon deleted successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // COUPON VALIDATION RESPONSE
    // =====================================================

    public static class CouponValidationResponse {

        private boolean valid;
        private String couponCode;
        private double orderAmount;
        private double discountAmount;
        private double finalAmount;
        private String message;


        public CouponValidationResponse(
                boolean valid,
                String couponCode,
                double orderAmount,
                double discountAmount,
                double finalAmount,
                String message) {

            this.valid = valid;
            this.couponCode = couponCode;
            this.orderAmount = orderAmount;
            this.discountAmount = discountAmount;
            this.finalAmount = finalAmount;
            this.message = message;
        }


        public boolean isValid() {
            return valid;
        }


        public String getCouponCode() {
            return couponCode;
        }


        public double getOrderAmount() {
            return orderAmount;
        }


        public double getDiscountAmount() {
            return discountAmount;
        }


        public double getFinalAmount() {
            return finalAmount;
        }


        public String getMessage() {
            return message;
        }
    }
}

