package com.javaenterprise.admin.controller;

import com.javaenterprise.admin.dto.AdminProductResponse;
import com.javaenterprise.admin.service.AdminProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @GetMapping
    public List<AdminProductResponse> getAllProducts() {
        return adminProductService.getAllProducts();
    }

    @GetMapping("/pending")
    public List<AdminProductResponse> getPendingProducts() {
        return adminProductService.getPendingProducts();
    }

    @PutMapping("/{id}/approve")
    public AdminProductResponse approveProduct(@PathVariable Long id) {
        return adminProductService.approveProduct(id);
    }

    @PutMapping("/{id}/reject")
    public AdminProductResponse rejectProduct(@PathVariable Long id) {
        return adminProductService.rejectProduct(id);
    }

    @PatchMapping("/{id}/disable")
    public AdminProductResponse disableProduct(@PathVariable Long id) {
        return adminProductService.disableProduct(id);
    }

    @PatchMapping("/{id}/enable")
    public AdminProductResponse enableProduct(@PathVariable Long id) {
        return adminProductService.enableProduct(id);
    }
}