package com.shopstack.dto.product;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    private String description;
    private Long parentId;
}
