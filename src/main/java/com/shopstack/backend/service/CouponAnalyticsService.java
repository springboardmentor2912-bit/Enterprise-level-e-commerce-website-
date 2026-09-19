package com.shopstack.backend.service;

import com.shopstack.backend.dto.CouponAnalyticsResponse;
import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.entity.CouponUsage;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.CouponUsageRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CouponAnalyticsService {

    private final CouponRepository couponRepository;

    private final CouponUsageRepository couponUsageRepository;


    public CouponAnalyticsService(
            CouponRepository couponRepository,
            CouponUsageRepository couponUsageRepository
    ) {

        this.couponRepository =
                couponRepository;

        this.couponUsageRepository =
                couponUsageRepository;
    }


    // =========================================================
    // GET ANALYTICS FOR ALL COUPONS
    // =========================================================

    public List<CouponAnalyticsResponse>
    getAllCouponAnalytics() {

        List<Coupon> coupons =
                couponRepository.findAll();

        List<CouponAnalyticsResponse>
                responses =
                new ArrayList<>();


        for (Coupon coupon : coupons) {

            List<CouponUsage> usages =
                    couponUsageRepository
                            .findByCouponId(
                                    coupon.getId()
                            );


            // -----------------------------------------
            // TOTAL DISCOUNT PROVIDED
            // -----------------------------------------

            double totalDiscount =
                    usages.stream()
                            .mapToDouble(
                                    usage ->
                                            usage.getDiscountAmount()
                            )
                            .sum();


            // -----------------------------------------
            // USED COUNT
            // -----------------------------------------

            int usedCount =
                    usages.size();


            // -----------------------------------------
            // REMAINING USES
            // -----------------------------------------

            int remainingUses = 0;

            if (coupon.getUsageLimit() != null) {

                remainingUses =
                        Math.max(
                                0,
                                coupon.getUsageLimit()
                                        - usedCount
                        );
            }


            // -----------------------------------------
            // ROUND TOTAL DISCOUNT
            // -----------------------------------------

            totalDiscount =
                    Math.round(
                            totalDiscount * 100.0
                    ) / 100.0;


            // -----------------------------------------
            // RESPONSE
            // -----------------------------------------

            CouponAnalyticsResponse response =
                    new CouponAnalyticsResponse(

                            coupon.getId(),

                            coupon.getCode(),

                            coupon.getUsageLimit(),

                            usedCount,

                            remainingUses,

                            totalDiscount,

                            coupon.getActive()
                    );


            responses.add(response);
        }


        return responses;
    }


    // =========================================================
    // GET ANALYTICS FOR ONE COUPON
    // =========================================================

    public CouponAnalyticsResponse
    getCouponAnalytics(Long couponId) {

        Coupon coupon =
                couponRepository.findById(
                                couponId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );


        List<CouponUsage> usages =
                couponUsageRepository
                        .findByCouponId(
                                couponId
                        );


        double totalDiscount =
                usages.stream()
                        .mapToDouble(
                                usage ->
                                        usage.getDiscountAmount()
                        )
                        .sum();


        int usedCount =
                usages.size();


        int remainingUses = 0;

        if (coupon.getUsageLimit() != null) {

            remainingUses =
                    Math.max(
                            0,
                            coupon.getUsageLimit()
                                    - usedCount
                    );
        }


        totalDiscount =
                Math.round(
                        totalDiscount * 100.0
                ) / 100.0;


        return new CouponAnalyticsResponse(

                coupon.getId(),

                coupon.getCode(),

                coupon.getUsageLimit(),

                usedCount,

                remainingUses,

                totalDiscount,

                coupon.getActive()
        );
    }
}