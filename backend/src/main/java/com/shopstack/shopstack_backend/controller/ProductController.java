package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.ProductRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.ProductResponse;
import com.shopstack.shopstack_backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

import com.shopstack.shopstack_backend.dto.response.InventoryReportResponse;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =========================
    // CREATE PRODUCT
    // =========================

    @PreAuthorize("hasRole('VENDOR')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                true,
                                "Product Created Successfully",
                                response
                        )
                );
    }

    // =========================
    // GET PRODUCT BY ID
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            @PathVariable Long id) {

        ProductResponse response =
                productService.getProductById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // GET ALL PRODUCTS
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts() {

        List<ProductResponse> response =
                productService.getAllProducts();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // SEARCH PRODUCTS
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam String keyword) {

        List<ProductResponse> response =
                productService.searchProducts(keyword);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Search Completed Successfully",
                        response
                )
        );
    }

    // =========================
    // PRODUCTS BY CATEGORY
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId) {

        List<ProductResponse> response =
                productService.getProductsByCategory(categoryId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products Retrieved By Category",
                        response
                )
        );
    }

    // =========================
    // PRODUCTS BY VENDOR
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsByVendor(
            @PathVariable Long vendorId) {

        List<ProductResponse> response =
                productService.getProductsByVendor(vendorId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products Retrieved By Vendor",
                        response
                )
        );
    }

    // =========================
    // FILTER PRODUCTS BY PRICE
    // =========================

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> filterProductsByPrice(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {

        List<ProductResponse> response =
                productService.filterProductsByPrice(
                        minPrice,
                        maxPrice
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Products Filtered Successfully",
                        response
                )
        );
    }

    // =========================
    // LOW STOCK PRODUCTS
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLowStockProducts(
            @RequestParam(defaultValue = "5")
            Integer threshold) {

        List<ProductResponse> response =
                productService.getLowStockProducts(
                        threshold
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Low Stock Products Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
// INVENTORY REPORT
// =========================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/inventory-report")
    public ResponseEntity<ApiResponse<InventoryReportResponse>>
    getInventoryReport(
            @RequestParam(defaultValue = "5")
            Integer threshold) {

        InventoryReportResponse response =
                productService.getInventoryReport(
                        threshold
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Inventory Report Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // APPROVE PRODUCT
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ProductResponse>> approveProduct(
            @PathVariable Long id) {

        ProductResponse response =
                productService.approveProduct(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product Approved Successfully",
                        response
                )
        );
    }

    // =========================
    // REJECT PRODUCT
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<ProductResponse>> rejectProduct(
            @PathVariable Long id) {

        ProductResponse response =
                productService.rejectProduct(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Product Rejected Successfully",
                        response
                )
        );
    }

    // =========================
    // UPDATE STOCK
    // =========================

    @PreAuthorize("hasRole('VENDOR')")
    @PutMapping("/{id}/stock")
    public ResponseEntity<ApiResponse<ProductResponse>> updateStock(
            @PathVariable Long id,
            @RequestParam Integer stockQuantity) {

        ProductResponse response =
                productService.updateStock(
                        id,
                        stockQuantity
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Stock Updated Successfully",
                        response
                )
        );
    }
}