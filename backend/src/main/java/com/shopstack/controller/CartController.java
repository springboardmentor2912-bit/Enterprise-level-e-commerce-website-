package com.shopstack.controller;

import com.shopstack.dto.AddToCartRequest;
import com.shopstack.dto.CartItemDTO;
import com.shopstack.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(cartService.getCustomerCart(email));
    }

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        String email = authentication.getName();
        return new ResponseEntity<>(cartService.addToCart(email, request), HttpStatus.CREATED);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartItemDTO> updateCartItemQuantity(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String email = authentication.getName();
        Integer quantity = Integer.parseInt(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateQuantity(id, email, quantity));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> removeFromCart(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        cartService.removeFromCart(id, email);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String email = authentication.getName();
        cartService.clearCart(email);
        return ResponseEntity.noContent().build();
    }
}
