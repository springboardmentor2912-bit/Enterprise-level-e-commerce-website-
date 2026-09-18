package com.shopstack.service;

import com.shopstack.dto.product.CategoryRequest;
import com.shopstack.entity.Category;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @Transactional
    public Category create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("A category with this name already exists");
        }
        Category parent = request.getParentId() != null ? getById(request.getParentId()) : null;
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .parent(parent)
                .build();
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long id) {
        categoryRepository.delete(getById(id));
    }
}
