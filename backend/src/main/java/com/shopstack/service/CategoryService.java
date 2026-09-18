package com.shopstack.service;

import com.shopstack.model.Category;
import com.shopstack.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category already exists with name: " + category.getName());
        }
        if (category.getSlug() == null || category.getSlug().isBlank()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return categoryRepository.save(category);
    }
}
