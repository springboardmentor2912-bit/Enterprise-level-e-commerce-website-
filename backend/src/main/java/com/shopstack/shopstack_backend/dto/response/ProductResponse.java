package com.shopstack.shopstack_backend.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductResponse {

    private Long id;

    private String productName;

    private String brand;

    private String description;

    // Original price
    private BigDecimal price;

    // Discount percentage
    private BigDecimal discountPercentage;

    // Price after discount
    private BigDecimal finalPrice;

    private Integer stockQuantity;

    private String categoryName;

    private String vendorName;
}