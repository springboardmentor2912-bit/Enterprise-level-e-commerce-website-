package shopstack_backend.dto;

import java.math.BigDecimal;

public class ProductRequestDTO {

    private String name;
    private String brand;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Long categoryId;
    private Long vendorId;
    private String imageUrl;

    // Default Constructor
    public ProductRequestDTO() {
    }

    // Parameterized Constructor
    public ProductRequestDTO(String name, String brand, String description, BigDecimal price, Integer stockQuantity, Long categoryId, Long vendorId, String imageUrl) {
        this.name = name;
        this.brand = brand;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.categoryId = categoryId;
        this.vendorId = vendorId;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}