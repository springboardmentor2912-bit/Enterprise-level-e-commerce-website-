package com.javaenterprise.wishlist.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WishlistRequest {

    @NotNull
    private Long productId;
}