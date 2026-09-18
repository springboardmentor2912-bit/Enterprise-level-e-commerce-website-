package com.javaenterprise.coupon.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class CouponResponse {
    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private LocalDate startDate; // 🆕 Added
    private LocalDate expiryDate;
    private BigDecimal maxDiscount; // 🆕 Added
    private Integer usageLimit;
    private Integer usedCount;
    private boolean active;
    private String description;

    // 🆕 Added for Analytics
    private BigDecimal totalDiscountProvided;
    private Long totalUsageCount;
}