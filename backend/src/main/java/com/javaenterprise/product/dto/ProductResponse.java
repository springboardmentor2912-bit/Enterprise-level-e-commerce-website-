package com.javaenterprise.product.dto;

import com.javaenterprise.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProductResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer stock;

    private String imageUrl;

    private boolean active;

    private String category;

    private String vendor;
    private ProductStatus status;
    private Integer discountPercentage;
}