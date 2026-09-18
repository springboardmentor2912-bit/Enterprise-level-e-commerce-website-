package com.javaenterprise.product.controller;

import com.javaenterprise.product.dto.CategoryRequest;
import com.javaenterprise.product.dto.CategoryResponse;
import com.javaenterprise.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @PostMapping
    public CategoryResponse add(@Valid @RequestBody CategoryRequest request){

        return service.add(request);
    }

    @GetMapping
    public List<CategoryResponse> getAll(){

        return service.getAll();
    }

}