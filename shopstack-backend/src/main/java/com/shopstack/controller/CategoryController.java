package com.shopstack.controller;

import com.shopstack.dto.common.ApiResponse;
import com.shopstack.dto.product.CategoryRequest;
import com.shopstack.entity.Category;
import com.shopstack.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<Category>> getAll() {
        return ApiResponse.ok(categoryService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Category> create(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok("Category created", categoryService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.ok("Category deleted", null);
    }
}
