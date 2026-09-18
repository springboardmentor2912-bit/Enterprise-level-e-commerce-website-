package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.CartResponse;

public interface CartService {

    CartResponse addToCart(
            Long productId,
            Integer quantity
    );

    CartResponse getMyCart();

    CartResponse updateCartItem(
            Long productId,
            Integer quantity
    );

    void removeFromCart(Long productId);

    void clearCart();
}