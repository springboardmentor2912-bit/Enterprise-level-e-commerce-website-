package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.ProductResponse;
import com.infosys.springboard.authentication.service.ProductService;

@RestController
@RequestMapping("/customer/products")
public class CustomerProductController {

    private final ProductService productService;

    public CustomerProductController(
            ProductService productService) {

        this.productService = productService;
    }


    // =========================================================
    // CUSTOMER - BROWSE ALL PRODUCTS
    // =========================================================

    @GetMapping
    public List<ProductResponse> getAllProducts() {

        return productService.getAllProducts();
    }


    // =========================================================
    // CUSTOMER - SEARCH PRODUCTS BY NAME
    // Example:
    // /customer/products/search?name=iphone
    // =========================================================

    @GetMapping("/search")
    public List<ProductResponse> searchProducts(
            @RequestParam String name) {

        return productService.searchProducts(name);
    }


    // =========================================================
    // CUSTOMER - SEARCH PRODUCTS BY CATEGORY
    // Example:
    // /customer/products/category?category=electronics
    // =========================================================

    @GetMapping("/category")
    public List<ProductResponse> searchByCategory(
            @RequestParam String category) {

        return productService.searchByCategory(category);
    }
}