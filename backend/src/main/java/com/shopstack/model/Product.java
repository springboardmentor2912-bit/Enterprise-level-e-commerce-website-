package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String brand;

    @Column(unique = true)
    private String sku;

    @Column(nullable = false)
    private Double price;

    private Double discountPrice;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendorProfile;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.ACTIVE;

    private Boolean featured = false;

    private Double rating = 4.8;

    private Integer reviewCount = 12;

    private LocalDateTime createdAt;

    public Product() {}

    public Product(Long id, String title, String description, String brand, String sku, Double price, Double discountPrice, Integer stockQuantity, String imageUrl, Category category, VendorProfile vendorProfile, ProductStatus status, Boolean featured, Double rating, Integer reviewCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.brand = brand;
        this.sku = sku;
        this.price = price;
        this.discountPrice = discountPrice;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.category = category;
        this.vendorProfile = vendorProfile;
        this.status = status != null ? status : ProductStatus.ACTIVE;
        this.featured = featured != null ? featured : false;
        this.rating = rating != null ? rating : 4.8;
        this.reviewCount = reviewCount != null ? reviewCount : 0;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getDiscountPrice() { return discountPrice; }
    public void setDiscountPrice(Double discountPrice) { this.discountPrice = discountPrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public VendorProfile getVendorProfile() { return vendorProfile; }
    public void setVendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Long id;
        private String title;
        private String description;
        private String brand;
        private String sku;
        private Double price;
        private Double discountPrice;
        private Integer stockQuantity;
        private String imageUrl;
        private Category category;
        private VendorProfile vendorProfile;
        private ProductStatus status = ProductStatus.ACTIVE;
        private Boolean featured = false;
        private Double rating = 4.8;
        private Integer reviewCount = 0;
        private LocalDateTime createdAt;

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder title(String title) { this.title = title; return this; }
        public ProductBuilder description(String description) { this.description = description; return this; }
        public ProductBuilder brand(String brand) { this.brand = brand; return this; }
        public ProductBuilder sku(String sku) { this.sku = sku; return this; }
        public ProductBuilder price(Double price) { this.price = price; return this; }
        public ProductBuilder discountPrice(Double discountPrice) { this.discountPrice = discountPrice; return this; }
        public ProductBuilder stockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; return this; }
        public ProductBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public ProductBuilder category(Category category) { this.category = category; return this; }
        public ProductBuilder vendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; return this; }
        public ProductBuilder status(ProductStatus status) { this.status = status; return this; }
        public ProductBuilder featured(Boolean featured) { this.featured = featured; return this; }
        public ProductBuilder rating(Double rating) { this.rating = rating; return this; }
        public ProductBuilder reviewCount(Integer reviewCount) { this.reviewCount = reviewCount; return this; }
        public ProductBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Product build() {
            return new Product(id, title, description, brand, sku, price, discountPrice, stockQuantity, imageUrl, category, vendorProfile, status, featured, rating, reviewCount, createdAt);
        }
    }
}
