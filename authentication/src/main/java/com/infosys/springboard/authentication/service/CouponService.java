package com.infosys.springboard.authentication.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.CouponRequest;
import com.infosys.springboard.authentication.dto.CouponResponse;
import com.infosys.springboard.authentication.dto.CouponValidationResponse;
import com.infosys.springboard.authentication.entity.Coupon;
import com.infosys.springboard.authentication.repository.CouponRepository;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    // =========================================================
    // CREATE COUPON
    // =========================================================

    public CouponResponse createCoupon(CouponRequest request) {

        String code = request.getCode()
                .trim()
                .toUpperCase();

        if (couponRepository.existsByCode(code)) {
            throw new RuntimeException("Coupon code already exists");
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(
                        request.getDiscountType() != null
                                ? request.getDiscountType().trim().toUpperCase()
                                : null
                )
                .discountValue(request.getDiscountValue())
                .minimumOrderAmount(request.getMinimumOrderAmount())
                .maximumDiscount(request.getMaximumDiscount())
                .startDate(request.getStartDate())
                .expiryDate(request.getExpiryDate())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .active(
                        request.getActive() != null
                                ? request.getActive()
                                : true
                )
                .build();

        Coupon savedCoupon = couponRepository.save(coupon);

        return convertToResponse(savedCoupon);
    }

    // =========================================================
    // GET ALL COUPONS
    // =========================================================

    public List<CouponResponse> getAllCoupons() {

        return couponRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // GET COUPON BY ID
    // =========================================================

    public CouponResponse getCouponById(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found"));

        return convertToResponse(coupon);
    }

    // =========================================================
    // UPDATE COUPON
    // =========================================================

    public CouponResponse updateCoupon(
            Long id,
            CouponRequest request) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found"));

        String newCode = request.getCode()
                .trim()
                .toUpperCase();

        if (!coupon.getCode().equals(newCode)
                && couponRepository.existsByCode(newCode)) {

            throw new RuntimeException("Coupon code already exists");
        }

        coupon.setCode(newCode);

        coupon.setDiscountType(
                request.getDiscountType() != null
                        ? request.getDiscountType().trim().toUpperCase()
                        : null
        );

        coupon.setDiscountValue(
                request.getDiscountValue());

        coupon.setMinimumOrderAmount(
                request.getMinimumOrderAmount());

        coupon.setMaximumDiscount(
                request.getMaximumDiscount());

        coupon.setStartDate(
                request.getStartDate());

        coupon.setExpiryDate(
                request.getExpiryDate());

        coupon.setUsageLimit(
                request.getUsageLimit());

        if (request.getActive() != null) {
            coupon.setActive(request.getActive());
        }

        if (coupon.getUsedCount() == null) {
            coupon.setUsedCount(0);
        }

        Coupon updatedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(updatedCoupon);
    }

    // =========================================================
    // ACTIVATE / DEACTIVATE COUPON
    // =========================================================

    public CouponResponse toggleCoupon(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found"));

        coupon.setActive(
                !Boolean.TRUE.equals(coupon.getActive()));

        Coupon updatedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(updatedCoupon);
    }

    // =========================================================
    // DELETE COUPON
    // =========================================================

    public void deleteCoupon(Long id) {

        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Coupon not found"));

        couponRepository.delete(coupon);
    }

    // =========================================================
    // CUSTOMER COUPON VALIDATION
    // =========================================================

    public CouponValidationResponse validateCoupon(
            String code,
            BigDecimal orderAmount) {

        // -----------------------------------------------------
        // CHECK COUPON CODE
        // -----------------------------------------------------

        if (code == null || code.trim().isEmpty()) {

            return new CouponValidationResponse(
                    false,
                    "Coupon code is required",
                    null,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK ORDER AMOUNT
        // -----------------------------------------------------

        if (orderAmount == null
                || orderAmount.compareTo(BigDecimal.ZERO) <= 0) {

            return new CouponValidationResponse(
                    false,
                    "Invalid order amount",
                    code,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // FIND COUPON
        // -----------------------------------------------------

        Coupon coupon = couponRepository
                .findByCode(code.trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {

            return new CouponValidationResponse(
                    false,
                    "Invalid coupon code",
                    code,
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK ACTIVE STATUS
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(coupon.getActive())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon is inactive",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK START DATE
        // -----------------------------------------------------

        LocalDateTime now = LocalDateTime.now();

        if (coupon.getStartDate() != null
                && now.isBefore(coupon.getStartDate())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon is not active yet",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK EXPIRY DATE
        // -----------------------------------------------------

        if (coupon.getExpiryDate() != null
                && now.isAfter(coupon.getExpiryDate())) {

            return new CouponValidationResponse(
                    false,
                    "Coupon has expired",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK USAGE LIMIT
        // -----------------------------------------------------

        Integer usedCount =
                coupon.getUsedCount() == null
                        ? 0
                        : coupon.getUsedCount();

        if (coupon.getUsageLimit() != null
                && usedCount >= coupon.getUsageLimit()) {

            return new CouponValidationResponse(
                    false,
                    "Coupon usage limit reached",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CHECK MINIMUM ORDER AMOUNT
        // -----------------------------------------------------

        if (coupon.getMinimumOrderAmount() != null
                && orderAmount.compareTo(
                        coupon.getMinimumOrderAmount()) < 0) {

            return new CouponValidationResponse(
                    false,
                    "Minimum order amount is ₹"
                            + coupon.getMinimumOrderAmount(),
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CALCULATE DISCOUNT
        // -----------------------------------------------------

        BigDecimal discountAmount;

        // -----------------------------------------------------
        // PERCENTAGE DISCOUNT
        // -----------------------------------------------------

        if ("PERCENTAGE".equalsIgnoreCase(
                coupon.getDiscountType())) {

            discountAmount = orderAmount
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100));

            // Maximum discount limit
            if (coupon.getMaximumDiscount() != null
                    && discountAmount.compareTo(
                            coupon.getMaximumDiscount()) > 0) {

                discountAmount =
                        coupon.getMaximumDiscount();
            }
        }

        // -----------------------------------------------------
        // FIXED DISCOUNT
        // -----------------------------------------------------

        else if ("FIXED".equalsIgnoreCase(
                coupon.getDiscountType())) {

            discountAmount =
                    coupon.getDiscountValue();

            // Discount cannot exceed order amount
            if (discountAmount.compareTo(orderAmount) > 0) {
                discountAmount = orderAmount;
            }
        }

        // -----------------------------------------------------
        // INVALID DISCOUNT TYPE
        // -----------------------------------------------------

        else {

            return new CouponValidationResponse(
                    false,
                    "Invalid discount type",
                    coupon.getCode(),
                    BigDecimal.ZERO,
                    orderAmount
            );
        }

        // -----------------------------------------------------
        // CALCULATE FINAL AMOUNT
        // -----------------------------------------------------

        BigDecimal finalAmount =
                orderAmount.subtract(discountAmount);

        return new CouponValidationResponse(
                true,
                "Coupon applied successfully",
                coupon.getCode(),
                discountAmount,
                finalAmount
        );
    }

    // =========================================================
    // GET ACTIVE COUPONS FOR CUSTOMER
    // =========================================================
    //
    // IMPORTANT:
    // The database has already confirmed that the coupons are
    // active and inside their valid date range.
    //
    // Therefore this method only retrieves coupons where
    // active = true.
    //
    // Validation of expiry, usage limit and minimum order
    // amount is still performed when the customer actually
    // applies a coupon.
    // =========================================================

    public List<CouponResponse> getActiveCouponsForCustomer() {

        List<Coupon> coupons =
                couponRepository.findByActive(Boolean.TRUE);

        System.out.println(
                "========== CUSTOMER ACTIVE COUPONS ==========");

        System.out.println(
                "ACTIVE COUPON COUNT = " + coupons.size());

        for (Coupon coupon : coupons) {

            System.out.println(
                    "ID=" + coupon.getId()
                    + ", CODE=" + coupon.getCode()
                    + ", ACTIVE=" + coupon.getActive()
                    + ", START=" + coupon.getStartDate()
                    + ", EXPIRY=" + coupon.getExpiryDate()
                    + ", USAGE="
                    + coupon.getUsedCount()
                    + "/"
                    + coupon.getUsageLimit()
            );
        }

        System.out.println(
                "==============================================");

        return coupons
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================

    private CouponResponse convertToResponse(
            Coupon coupon) {

        return new CouponResponse(
                coupon.getId(),
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                coupon.getMinimumOrderAmount(),
                coupon.getMaximumDiscount(),
                coupon.getStartDate(),
                coupon.getExpiryDate(),
                coupon.getUsageLimit(),
                coupon.getUsedCount(),
                coupon.getActive()
        );
    }
}