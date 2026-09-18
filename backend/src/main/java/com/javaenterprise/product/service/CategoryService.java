package com.javaenterprise.product.service;

import com.javaenterprise.product.dto.CategoryRequest;
import com.javaenterprise.product.dto.CategoryResponse;
import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryResponse add(CategoryRequest request) {

        if(categoryRepository.existsByName(request.getName()))
            throw new RuntimeException("Category already exists");

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        categoryRepository.save(category);

        return map(category);
    }

    public List<CategoryResponse> getAll() {

        return categoryRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    private CategoryResponse map(Category category){

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}