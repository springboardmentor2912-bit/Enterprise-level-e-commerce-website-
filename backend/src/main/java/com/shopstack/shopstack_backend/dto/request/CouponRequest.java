package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CouponRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0.1")
    @DecimalMax(value = "100.0")
    private Double discountPercentage;

    @NotNull
    @DecimalMin(value = "0.0")
    private Double minimumOrderAmount;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime expiryDate;

    @NotNull
    @Min(1)
    private Integer usageLimit;
}