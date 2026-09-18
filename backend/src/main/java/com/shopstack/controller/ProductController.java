package com.shopstack.controller;

import com.shopstack.dto.InventoryHistoryDTO;
import com.shopstack.dto.ProductDTO;
import com.shopstack.dto.ProductReviewDTO;
import com.shopstack.dto.ProductReviewRequest;
import com.shopstack.entity.ApprovalStatus;
import com.shopstack.service.ProductReviewService;
import com.shopstack.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final ProductReviewService reviewService;

    public ProductController(ProductService productService, ProductReviewService reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(productService.filterProducts(categoryId, search, minPrice, maxPrice));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<ProductDTO>> getFeaturedProducts() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductDTO>> getNewArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<ProductDTO>> getBestSellers() {
        return ResponseEntity.ok(productService.getBestSellers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam(name = "query", required = false) String query,
                                                           @RequestParam(name = "search", required = false) String search) {
        String searchTerm = (query != null && !query.isBlank()) ? query : search;
        return ResponseEntity.ok(productService.searchProducts(searchTerm));
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterProductsExtended(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double rating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductDTO> result = productService.filterProductsExtended(
                categoryId, brand, search, minPrice, maxPrice, rating, sort, page, size
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductsByCategory(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ProductReviewDTO>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(id));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ProductReviewDTO> addProductReview(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ProductReviewRequest request) {
        String email = authentication.getName();
        ProductReviewDTO review = reviewService.addReview(id, email, request);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDTO>> getPendingProducts() {
        return ResponseEntity.ok(productService.getPendingProducts());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> approveProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.updateApprovalStatus(id, ApprovalStatus.APPROVED));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> rejectProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.updateApprovalStatus(id, ApprovalStatus.REJECTED));
    }

    @GetMapping("/{id}/inventory-history")
    public ResponseEntity<List<InventoryHistoryDTO>> getInventoryHistory(
            Authentication authentication,
            @PathVariable Long id) {
        String email = authentication.getName();
        return ResponseEntity.ok(productService.getInventoryHistory(id, email));
    }
}
