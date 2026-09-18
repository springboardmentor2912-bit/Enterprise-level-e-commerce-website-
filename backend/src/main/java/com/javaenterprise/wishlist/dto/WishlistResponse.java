package com.javaenterprise.wishlist.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class WishlistResponse {

    private Long wishlistId;

    private Long productId;

    private String productName;

    private String imageUrl;

    private BigDecimal price;

    private String category;
}