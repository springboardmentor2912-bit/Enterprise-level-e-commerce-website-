package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.CategoryRequest;
import com.shopstack.shopstack_backend.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    List<CategoryResponse> getAllCategories();
}
