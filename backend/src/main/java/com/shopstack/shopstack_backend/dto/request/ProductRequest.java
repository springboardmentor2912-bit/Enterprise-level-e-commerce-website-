package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank
    private String productName;

    @NotBlank
    private String brand;

    private String description;

    @NotNull
    private BigDecimal price;

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @NotNull
    private Integer stockQuantity;

    @NotNull
    private Long categoryId;

    @NotNull
    private Long vendorId;
}