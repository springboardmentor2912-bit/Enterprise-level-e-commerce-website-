package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.AddWishlistItemRequest;
import shopstack_backend.dto.WishlistItemResponseDTO;
import shopstack_backend.service.WishlistService;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "http://localhost:5173")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistItemResponseDTO>> getWishlist(Authentication authentication) {
        return ResponseEntity.ok(wishlistService.getWishlist(authentication.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItem(Authentication authentication,
                                      @RequestBody AddWishlistItemRequest request) {
        try {
            return ResponseEntity.ok(wishlistService.addItem(authentication.getName(), request.getProductId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<?> removeItem(@PathVariable Long productId, Authentication authentication) {
        try {
            return ResponseEntity.ok(wishlistService.removeItem(authentication.getName(), productId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}