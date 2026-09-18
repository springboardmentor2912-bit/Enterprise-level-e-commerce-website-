package com.shopstack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateProductRequest {

    @NotBlank(message = "Product title is required")
    private String title;

    private String description;
    private String brand;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be positive")
    private Double price;

    private Double discountPrice;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    private String imageUrl;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    public CreateProductRequest() {}

    public CreateProductRequest(String title, String description, String brand, Double price, Double discountPrice, Integer stockQuantity, String imageUrl, Long categoryId) {
        this.title = title;
        this.description = description;
        this.brand = brand;
        this.price = price;
        this.discountPrice = discountPrice;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.categoryId = categoryId;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
