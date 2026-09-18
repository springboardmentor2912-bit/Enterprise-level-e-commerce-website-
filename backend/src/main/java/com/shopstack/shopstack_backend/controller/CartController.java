package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.CartResponse;
import com.shopstack.shopstack_backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        CartResponse response =
                cartService.addToCart(
                        productId,
                        quantity
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product Added To Cart Successfully",
                        response
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getMyCart() {

        CartResponse response =
                cartService.getMyCart();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cart Retrieved Successfully",
                        response
                )
        );
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {

        CartResponse response =
                cartService.updateCartItem(
                        productId,
                        quantity
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cart Updated Successfully",
                        response
                )
        );
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @PathVariable Long productId) {

        cartService.removeFromCart(productId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product Removed From Cart Successfully",
                        null
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {

        cartService.clearCart();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cart Cleared Successfully",
                        null
                )
        );
    }
}