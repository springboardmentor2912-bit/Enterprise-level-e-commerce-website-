package com.shopstack.controller;

import com.shopstack.dto.CreateProductRequest;
import com.shopstack.model.Product;
import com.shopstack.model.ProductStatus;
import com.shopstack.model.Review;
import com.shopstack.model.VendorProfile;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.ProductService;
import com.shopstack.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final VendorService vendorService;

    public ProductController(ProductService productService, VendorService vendorService) {
        this.productService = productService;
        this.vendorService = vendorService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean featured) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(productService.searchProducts(search));
        }
        if (categoryId != null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }
        if (Boolean.TRUE.equals(featured)) {
            return ResponseEntity.ok(productService.getFeaturedProducts());
        }
        return ResponseEntity.ok(productService.getAllActiveProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductReviews(id));
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Product>> getVendorProducts(@PathVariable Long vendorId) {
        return ResponseEntity.ok(productService.getProductsByVendor(vendorId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Product> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateProductRequest request) {
        Long vendorId;
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            try {
                VendorProfile vendor = vendorService.getVendorByUserId(principal.getId());
                vendorId = vendor.getId();
            } catch (Exception e) {
                // If admin does not have a vendor profile, attach to first available vendor
                vendorId = vendorService.getAllVendors().stream()
                        .findFirst()
                        .map(VendorProfile::getId)
                        .orElse(1L);
            }
        } else {
            VendorProfile vendor = vendorService.getVendorByUserId(principal.getId());
            vendorId = vendor.getId();
        }
        return ResponseEntity.ok(productService.createProduct(vendorId, request));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<Product> updateProductStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam ProductStatus status) {
        validateVendorOwnership(principal, id);
        return ResponseEntity.ok(productService.updateProductStatus(id, status));
    }

    @PutMapping("/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<Product> updateProductStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam Integer stockQuantity) {
        validateVendorOwnership(principal, id);
        return ResponseEntity.ok(productService.updateStock(id, stockQuantity));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<Product> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody CreateProductRequest request) {
        validateVendorOwnership(principal, id);
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<?> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        validateVendorOwnership(principal, id);
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }

    private void validateVendorOwnership(UserPrincipal principal, Long productId) {
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            VendorProfile profile = vendorService.getVendorByUserId(principal.getId());
            Product product = productService.getProductById(productId);
            if (!product.getVendorProfile().getId().equals(profile.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You can only modify your store's products.");
            }
        }
    }
}
