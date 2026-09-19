package com.shopstack.backend.controller;

import com.shopstack.backend.dto.ProductRequest;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.dto.ProductResponse;
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private JwtService jwtService;

    @PostMapping
    public String addProduct(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProductRequest request) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        System.out.println("Add Product API called");
        return productService.addProduct(email, request);
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/my")
    public List<ProductResponse> getMyProducts(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return productService.getMyProducts(email);
    }

    @PutMapping("/{id}")
    public String updateProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ProductRequest request) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return productService.updateProduct(id, email, request);
    }

    @DeleteMapping("/{id}")
    public String deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return productService.deleteProduct(id, email);
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}