package com.shopstack.dto.coupon;

import com.shopstack.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponRequest {
    @NotBlank
    private String code;

    private String description;

    @NotNull
    private DiscountType discountType;

    @NotNull
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount;
    private Integer usageLimit;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
}
