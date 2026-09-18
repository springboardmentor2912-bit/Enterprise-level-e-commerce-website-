package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.AddCartItemRequest;
import shopstack_backend.dto.CartResponseDTO;
import shopstack_backend.dto.UpdateCartItemRequest;
import shopstack_backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(Authentication authentication,
                                      @RequestBody AddCartItemRequest request) {
        try {
            CartResponseDTO cart = cartService.addItem(
                    authentication.getName(), request.getProductId(), request.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long itemId,
                                         Authentication authentication,
                                         @RequestBody UpdateCartItemRequest request) {
        try {
            CartResponseDTO cart = cartService.updateItemQuantity(
                    authentication.getName(), itemId, request.getQuantity());
            return ResponseEntity.ok(cart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId, Authentication authentication) {
        try {
            CartResponseDTO cart = cartService.removeItem(authentication.getName(), itemId);
            return ResponseEntity.ok(cart);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<CartResponseDTO> clearCart(Authentication authentication) {
        return ResponseEntity.ok(cartService.clearCart(authentication.getName()));
    }
}