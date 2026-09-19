package com.shopstack.backend.controller;

import com.shopstack.backend.dto.AddToCartRequest;
import com.shopstack.backend.dto.CartResponse;
import com.shopstack.backend.service.CartService;
import com.shopstack.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private JwtService jwtService;


    @PostMapping("/add")
    public String addToCart(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody AddToCartRequest request) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return cartService.addToCart(email, request);
    }


    @GetMapping
    public CartResponse getCart(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return cartService.getCart(email);
    }


    @PutMapping("/increase/{cartItemId}")
    public String increaseQuantity(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long cartItemId) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return cartService.increaseQuantity(email, cartItemId);
    }


    @PutMapping("/decrease/{cartItemId}")
    public String decreaseQuantity(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long cartItemId) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return cartService.decreaseQuantity(email, cartItemId);
    }


    @DeleteMapping("/remove/{cartItemId}")
    public String removeFromCart(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long cartItemId) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return cartService.removeFromCart(email, cartItemId);
    }
}