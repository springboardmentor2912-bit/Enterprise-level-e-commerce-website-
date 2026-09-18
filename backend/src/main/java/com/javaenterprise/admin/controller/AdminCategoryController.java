package com.javaenterprise.admin.controller;

import com.javaenterprise.admin.dto.AdminCategoryRequest;
import com.javaenterprise.admin.dto.AdminCategoryResponse;
import com.javaenterprise.admin.service.AdminCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {


    private final AdminCategoryService service;





    @GetMapping
    public List<AdminCategoryResponse> getAll(){

        return service.getAll();
    }


    @PutMapping("/{id}")
    public AdminCategoryResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AdminCategoryRequest request){

        return service.update(id, request);
    }


    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id){

        service.delete(id);

        return "Category deleted successfully";
    }
    @PostMapping
    public AdminCategoryResponse add(
            @Valid @RequestBody AdminCategoryRequest request,
            Authentication authentication){

        System.out.println("USER: " + authentication.getName());
        System.out.println("AUTHORITIES: " + authentication.getAuthorities());

        return service.add(request);
    }
}