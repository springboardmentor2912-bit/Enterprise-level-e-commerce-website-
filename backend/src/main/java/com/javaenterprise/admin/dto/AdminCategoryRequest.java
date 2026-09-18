package com.javaenterprise.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminCategoryRequest {

    @NotBlank
    private String name;

    private String description;
}