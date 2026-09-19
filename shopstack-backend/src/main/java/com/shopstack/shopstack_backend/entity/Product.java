
package com.shopstack.shopstack_backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Enumerated(EnumType.STRING)
    private ProductAvailability availability;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String productName;

    private String category;

    private String brand;

    @Column(length = 2000)
    private String description;

    // Original price
    @Column(nullable = false)
    private BigDecimal price;

    // Vendor discount percentage
    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    private Integer stockQuantity;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private User vendor;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    // =========================================================
    // Constructor
    // =========================================================

    public Product() {
    }


    // =========================================================
    // Before Insert
    // =========================================================

    @PrePersist
    public void prePersist() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (availability == null) {
            availability = ProductAvailability.ACTIVE;
        }

        if (discountPercentage == null) {
            discountPercentage = BigDecimal.ZERO;
        }
    }


    // =========================================================
    // Before Update
    // =========================================================

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();

        if (discountPercentage == null) {
            discountPercentage = BigDecimal.ZERO;
        }
    }


    // =========================================================
    // Discounted Price
    // =========================================================

    @Transient
    public BigDecimal getDiscountedPrice() {

        if (price == null) {
            return BigDecimal.ZERO;
        }

        if (discountPercentage == null ||
                discountPercentage.compareTo(BigDecimal.ZERO) <= 0) {

            return price;
        }

        BigDecimal discount =
                price.multiply(discountPercentage)
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                java.math.RoundingMode.HALF_UP
                        );

        return price.subtract(discount);
    }


    // =========================================================
    // Getters
    // =========================================================

    public Long getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public String getCategory() {
        return category;
    }

    public String getBrand() {
        return brand;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public User getVendor() {
        return vendor;
    }

    public ProductAvailability getAvailability() {
        return availability;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    // =========================================================
    // Setters
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setDiscountPercentage(BigDecimal discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public void setVendor(User vendor) {
        this.vendor = vendor;
    }

    public void setAvailability(ProductAvailability availability) {
        this.availability = availability;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

