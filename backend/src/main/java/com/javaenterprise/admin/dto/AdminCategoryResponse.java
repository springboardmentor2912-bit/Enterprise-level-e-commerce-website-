package com.javaenterprise.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminCategoryResponse {

    private Long id;

    private String name;

    private String description;
}