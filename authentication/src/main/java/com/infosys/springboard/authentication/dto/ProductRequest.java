package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequest {

    // ==========================================
    // PRODUCT NAME
    // ==========================================

    @NotBlank(message = "Product name is required")
    private String name;


    // ==========================================
    // PRODUCT CATEGORY
    // ==========================================

    @NotBlank(message = "Product category is required")
    private String category;


    // ==========================================
    // PRODUCT BRAND
    // ==========================================

    @NotBlank(message = "Product brand is required")
    private String brand;


    // ==========================================
    // PRODUCT DESCRIPTION
    // ==========================================

    @NotBlank(message = "Product description is required")
    private String description;


    // ==========================================
    // ORIGINAL PRODUCT PRICE
    // ==========================================

    @NotNull(message = "Original product price is required")
    @DecimalMin(
            value = "0.01",
            message = "Original product price must be greater than 0"
    )
    private BigDecimal originalPrice;


    // ==========================================
    // DISCOUNT PERCENTAGE
    // ==========================================

    @NotNull(message = "Discount percentage is required")
    @DecimalMin(
            value = "0",
            message = "Discount percentage cannot be negative"
    )
    @DecimalMax(
            value = "100",
            message = "Discount percentage cannot be greater than 100"
    )
    private BigDecimal discountPercentage;


    // ==========================================
    // PRODUCT PRICE
    // Final price after discount
    // ==========================================

    @NotNull(message = "Product price is required")
    @DecimalMin(
            value = "0.01",
            message = "Product price must be greater than 0"
    )
    private BigDecimal price;


    // ==========================================
    // STOCK QUANTITY
    // ==========================================

    @NotNull(message = "Product quantity is required")
    @Min(
            value = 0,
            message = "Product quantity cannot be negative"
    )
    private Integer quantity;


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    private String imageUrl;
}