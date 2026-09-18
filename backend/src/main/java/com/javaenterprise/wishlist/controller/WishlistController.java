package com.javaenterprise.wishlist.controller;

import com.javaenterprise.wishlist.dto.WishlistRequest;
import com.javaenterprise.wishlist.dto.WishlistResponse;
import com.javaenterprise.wishlist.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/wishlist")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping
    public WishlistResponse add(@Valid @RequestBody WishlistRequest request,
                                Authentication authentication) {

        return wishlistService.add(authentication, request);
    }

    @GetMapping
    public List<WishlistResponse> get(Authentication authentication) {

        return wishlistService.get(authentication);
    }

    @DeleteMapping("/{productId}")
    public void remove(@PathVariable Long productId,
                       Authentication authentication) {

        wishlistService.remove(productId, authentication);
    }
}