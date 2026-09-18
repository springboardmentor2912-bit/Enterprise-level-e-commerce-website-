package com.shopstack.service;

import com.shopstack.dto.AddToCartRequest;
import com.shopstack.dto.CartItemDTO;

import java.util.List;

public interface CartService {
    CartItemDTO addToCart(String customerEmail, AddToCartRequest request);
    CartItemDTO updateQuantity(Long itemId, String customerEmail, Integer quantity);
    void removeFromCart(Long itemId, String customerEmail);
    List<CartItemDTO> getCustomerCart(String customerEmail);
    void clearCart(String customerEmail);
}
