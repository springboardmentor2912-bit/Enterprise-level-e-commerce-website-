package com.javaenterprise.cart.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartResponse {

    private Long cartId;

    private Long productId;

    private String productName;

    private String imageUrl;

    private BigDecimal price;

    private Integer quantity;

    private BigDecimal subtotal;
    private Integer discountPercentage;
}