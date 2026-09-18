package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.product.ProductResponse;
import com.shopstack.entity.Product;
import com.shopstack.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ApiResponse<Page<ProductResponse>> browse(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Product> result;

        if (keyword != null && !keyword.isBlank()) {
            result = productService.searchProducts(keyword, pageable);
        } else if (categoryId != null || minPrice != null || maxPrice != null || brand != null) {
            result = productService.filterProducts(categoryId, minPrice, maxPrice, brand, pageable);
        } else {
            result = productService.getApprovedProducts(pageable);
        }

        return ApiResponse.ok(result.map(productService::toResponse));
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getOne(@PathVariable Long id) {
        return ApiResponse.ok(productService.toResponse(productService.getById(id)));
    }
}
