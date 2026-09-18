package com.shopstack.controller;

import com.shopstack.dto.WishlistItemDTO;
import com.shopstack.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<WishlistItemDTO>> getWishlist(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(wishlistService.getCustomerWishlist(email));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItemDTO> addToWishlist(Authentication authentication, @PathVariable Long productId) {
        String email = authentication.getName();
        return new ResponseEntity<>(wishlistService.addToWishlist(email, productId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromWishlist(Authentication authentication, @PathVariable Long productId) {
        String email = authentication.getName();
        wishlistService.removeFromWishlist(email, productId);
        return ResponseEntity.noContent().build();
    }
}
