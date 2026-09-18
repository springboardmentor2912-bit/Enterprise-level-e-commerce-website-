package com.javaenterprise.admin.service;

import com.javaenterprise.admin.dto.AdminCategoryRequest;
import com.javaenterprise.admin.dto.AdminCategoryResponse;
import com.javaenterprise.product.entity.Category;
import com.javaenterprise.product.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private final CategoryRepository categoryRepository;


    public AdminCategoryResponse add(AdminCategoryRequest request) {

        if(categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Category already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        categoryRepository.save(category);

        return map(category);
    }


    public List<AdminCategoryResponse> getAll() {

        return categoryRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }


    public AdminCategoryResponse update(
            Long id,
            AdminCategoryRequest request) {


        Category category = categoryRepository.findById(id)
                .orElseThrow();


        category.setName(request.getName());
        category.setDescription(request.getDescription());


        categoryRepository.save(category);

        return map(category);
    }


    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow();

        categoryRepository.delete(category);
    }


    private AdminCategoryResponse map(Category category){

        return AdminCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}