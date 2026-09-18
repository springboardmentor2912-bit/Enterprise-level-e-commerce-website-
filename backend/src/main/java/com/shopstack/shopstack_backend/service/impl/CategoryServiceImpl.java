package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.CategoryRequest;
import com.shopstack.shopstack_backend.dto.response.CategoryResponse;
import com.shopstack.shopstack_backend.entity.Category;
import com.shopstack.shopstack_backend.repository.CategoryRepository;
import com.shopstack.shopstack_backend.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setActive(true);

        Category savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        return mapToResponse(category);
    }

    @Override
    public List<CategoryResponse> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponse(Category category) {

        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setActive(category.isActive());

        return response;
    }
}