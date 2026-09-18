package com.javaenterprise.cart.controller;

import com.javaenterprise.cart.dto.CartRequest;
import com.javaenterprise.cart.dto.CartResponse;
import com.javaenterprise.cart.dto.CartSummaryResponse;
import com.javaenterprise.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/cart")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public CartResponse addToCart(@Valid @RequestBody CartRequest request,
                                  Authentication authentication) {

        return cartService.addToCart(request, authentication);
    }

    @GetMapping
    public CartSummaryResponse getCart(Authentication authentication) {

        return cartService.getCart(authentication);
    }

    @PutMapping("/{id}")
    public CartResponse updateQuantity(@PathVariable Long id,
                                       @Valid @RequestBody CartRequest request,
                                       Authentication authentication) {

        return cartService.updateQuantity(id, request, authentication);
    }

    @DeleteMapping("/{id}")
    public void removeItem(@PathVariable Long id,
                           Authentication authentication) {

        cartService.removeItem(id, authentication);
    }

    @DeleteMapping
    public void clearCart(Authentication authentication) {

        cartService.clearCart(authentication);
    }
}