package com.javaenterprise.admin.dto;

import com.javaenterprise.product.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminProductResponse {

    private Long id;

    private String name;

    private String description;

    private BigDecimal price;

    private Integer stock;

    private String imageUrl;

    private boolean active;

    private ProductStatus status;

    private String category;

    private String vendor;
}