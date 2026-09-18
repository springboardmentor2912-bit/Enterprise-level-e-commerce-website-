package com.shopstack.controller;

import com.shopstack.dto.cart.AddToCartRequest;
import com.shopstack.dto.cart.UpdateCartItemRequest;
import com.shopstack.dto.common.ApiResponse;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<?> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(cartService.toResponse(cartService.getOrCreateCart(principal.getId())));
    }

    @PostMapping("/items")
    public ApiResponse<?> addItem(@AuthenticationPrincipal UserPrincipal principal,
                                   @Valid @RequestBody AddToCartRequest request) {
        return ApiResponse.ok("Item added to cart", cartService.toResponse(cartService.addItem(principal.getId(), request)));
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<?> updateItem(@AuthenticationPrincipal UserPrincipal principal,
                                      @PathVariable Long productId,
                                      @Valid @RequestBody UpdateCartItemRequest request) {
        return ApiResponse.ok("Cart updated", cartService.toResponse(cartService.updateItemQuantity(principal.getId(), productId, request)));
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<?> removeItem(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        return ApiResponse.ok("Item removed", cartService.toResponse(cartService.removeItem(principal.getId(), productId)));
    }

    @DeleteMapping
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ApiResponse.ok("Cart cleared", null);
    }
}
