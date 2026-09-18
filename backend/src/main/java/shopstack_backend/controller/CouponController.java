package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.ApplyCouponRequest;
import shopstack_backend.dto.ApplyCouponResponseDTO;
import shopstack_backend.dto.AvailableCouponDTO;
import shopstack_backend.dto.CartResponseDTO;
import shopstack_backend.entity.Product;
import shopstack_backend.repository.ProductRepository;
import shopstack_backend.service.CartService;
import shopstack_backend.service.CouponService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

/**
 * Customer-facing coupon endpoints: browsing what's currently available,
 * and "Enter Coupon Code -> Apply Coupon" on the checkout page. Applying
 * validates against the customer's current cart (or a single Buy-Now
 * product) and previews the discount — it does NOT consume the coupon's
 * usage limit. That only happens once the order is actually placed (see
 * OrderService), so a customer previewing a coupon they don't end up
 * using never costs anyone else a usage slot.
 */
@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "http://localhost:5173")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    // Lists every currently-valid coupon (active, in-date, under its usage
    // limit) alongside whether THIS order qualifies for each one, so the
    // checkout page can show real, pickable codes instead of a blank
    // "enter a code" box the customer has no way to fill in.
    @PostMapping("/available")
    public ResponseEntity<List<AvailableCouponDTO>> getAvailableCoupons(
            Authentication authentication,
            @RequestBody(required = false) ApplyCouponRequest request) {
        try {
            ApplyCouponRequest safeRequest = request != null ? request : new ApplyCouponRequest();
            BigDecimal subtotal = resolveSubtotal(authentication.getName(), safeRequest);
            return ResponseEntity.ok(couponService.getAvailableCoupons(subtotal, authentication.getName()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            // Empty cart, missing product, etc. — nothing to show yet rather than an error.
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyCoupon(Authentication authentication,
                                          @RequestBody ApplyCouponRequest request) {
        try {
            BigDecimal subtotal = resolveSubtotal(authentication.getName(), request);
            ApplyCouponResponseDTO response = couponService.preview(request.getCode(), subtotal, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private BigDecimal resolveSubtotal(String email, ApplyCouponRequest request) {
        if (request.getProductId() != null) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found."));
            int quantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : 1;
            return product.getFinalPrice()
                    .multiply(BigDecimal.valueOf(quantity))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        CartResponseDTO cart = cartService.getCart(email);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalStateException("Your cart is empty.");
        }
        return cart.getTotalAmount();
    }
}