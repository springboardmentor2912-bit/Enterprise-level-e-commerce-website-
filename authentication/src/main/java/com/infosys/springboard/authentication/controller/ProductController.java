package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.ProductRequest;
import com.infosys.springboard.authentication.dto.ProductResponse;
import com.infosys.springboard.authentication.dto.StockResponse;
import com.infosys.springboard.authentication.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/vendor/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }


    // =========================================================
    // CREATE PRODUCT
    // POST /vendor/products
    // =========================================================

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {

        String vendorEmail =
                authentication.getName();

        ProductResponse response =
                productService.createProduct(
                        request,
                        vendorEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================================================
    // GET MY PRODUCTS
    // GET /vendor/products
    // =========================================================

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyProducts(
            Authentication authentication) {

        String vendorEmail =
                authentication.getName();

        List<ProductResponse> products =
                productService.getVendorProducts(
                        vendorEmail
                );

        return ResponseEntity.ok(products);
    }


    // =========================================================
    // GET PRODUCT BY ID
    // GET /vendor/products/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        ProductResponse product =
                productService.getProductById(id);

        return ResponseEntity.ok(product);
    }


    // =========================================================
    // GET CURRENT STOCK
    // GET /vendor/products/{id}/stock
    // =========================================================

    @GetMapping("/{id}/stock")
    public ResponseEntity<StockResponse> getCurrentStock(
            @PathVariable Long id,
            Authentication authentication) {

        String vendorEmail =
                authentication.getName();

        StockResponse response =
                productService.getCurrentStock(
                        id,
                        vendorEmail
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // UPDATE PRODUCT
    // PUT /vendor/products/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            Authentication authentication) {

        String vendorEmail =
                authentication.getName();

        ProductResponse response =
                productService.updateProduct(
                        id,
                        request,
                        vendorEmail
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // DELETE PRODUCT
    // DELETE /vendor/products/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {

        String vendorEmail =
                authentication.getName();

        productService.deleteProduct(
                id,
                vendorEmail
        );

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }
}