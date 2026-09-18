package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<?> myWishlist(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(wishlistService.getMyWishlist(principal.getId()).stream()
                .map(wishlistService::toResponse).toList());
    }

    @PostMapping("/{productId}")
    public ApiResponse<?> add(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        return ApiResponse.ok("Added to wishlist",
                wishlistService.toResponse(wishlistService.addToWishlist(principal.getId(), productId)));
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> remove(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long productId) {
        wishlistService.removeFromWishlist(principal.getId(), productId);
        return ApiResponse.ok("Removed from wishlist", null);
    }
}
