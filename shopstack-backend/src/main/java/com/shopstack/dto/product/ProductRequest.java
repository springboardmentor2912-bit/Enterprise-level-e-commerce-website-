package com.shopstack.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String brand;
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    private BigDecimal discountPrice;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private List<String> images;

    // Initial stock when creating a product
    private Integer initialStock;
    private Integer lowStockThreshold;
    private String warehouseLocation;
}
