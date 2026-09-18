package com.shopstack.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.persistence.Column(length = 1000)
    private String name;
    private String category;
    private double price;
    
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String imageUrl;
    
    private Long vendorId;
    private Integer stock = 10;
    private String status = "APPROVED"; // PENDING, APPROVED, REJECTED
    private String rejectionReason;

    private String brand;
    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String description;

    private Double discountPercentage = 0.0;
    private Double finalPrice;
    private boolean couponsEnabled = true;

    @jakarta.persistence.ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "product_images", joinColumns = @jakarta.persistence.JoinColumn(name = "product_id"))
    @jakarta.persistence.Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images = new ArrayList<>();

    public Product() {}

    public Product(String name, String category, double price, String imageUrl) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
        this.vendorId = null;
        this.stock = 10;
        this.status = "APPROVED";
        this.rejectionReason = null;
        this.discountPercentage = 0.0;
        this.finalPrice = calculateFinalPrice();
    }

    public Product(String name, String category, double price, String imageUrl, Long vendorId, Integer stock, String status) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageUrl = imageUrl;
        this.vendorId = vendorId;
        this.stock = stock != null ? stock : 10;
        this.status = status != null ? status : "PENDING";
        this.rejectionReason = null;
        this.discountPercentage = 0.0;
        this.finalPrice = calculateFinalPrice();
    }

    public double calculateFinalPrice() {
        if (discountPercentage != null && discountPercentage > 0) {
            double discounted = price * (1.0 - (discountPercentage / 100.0));
            return Math.round(discounted * 100.0) / 100.0;
        }
        return Math.round(price * 100.0) / 100.0;
    }

    @jakarta.persistence.PrePersist
    @jakarta.persistence.PreUpdate
    public void prePersistOrUpdate() {
        if (discountPercentage == null || discountPercentage < 0) {
            discountPercentage = 0.0;
        }
        this.finalPrice = calculateFinalPrice();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { 
        this.price = price; 
        this.finalPrice = calculateFinalPrice();
    }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getDiscountPercentage() { return discountPercentage != null ? discountPercentage : 0.0; }
    public void setDiscountPercentage(Double discountPercentage) { 
        this.discountPercentage = discountPercentage != null ? discountPercentage : 0.0;
        this.finalPrice = calculateFinalPrice();
    }
    public Double getFinalPrice() { 
        if (finalPrice == null) {
            return calculateFinalPrice();
        }
        return finalPrice; 
    }
    public void setFinalPrice(Double finalPrice) { this.finalPrice = finalPrice; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    @jakarta.persistence.Transient
    private Double averageRating;

    @jakarta.persistence.Transient
    private Integer reviewCount;

    @jakarta.persistence.Transient
    private String vendorName;

    @jakarta.persistence.Transient
    private String vendorEmail;

    @jakarta.persistence.Transient
    private String vendorPhone;

    @jakarta.persistence.Transient
    private String vendorCode;

    @jakarta.persistence.Transient
    private String vendorAddress;

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }
    public String getVendorPhone() { return vendorPhone; }
    public void setVendorPhone(String vendorPhone) { this.vendorPhone = vendorPhone; }
    public String getVendorCode() { return vendorCode; }
    public void setVendorCode(String vendorCode) { this.vendorCode = vendorCode; }
    public String getVendorAddress() { return vendorAddress; }
    public void setVendorAddress(String vendorAddress) { this.vendorAddress = vendorAddress; }

    public boolean isCouponsEnabled() { return couponsEnabled; }
    public void setCouponsEnabled(boolean couponsEnabled) { this.couponsEnabled = couponsEnabled; }

    private String returnPolicy = "7_DAYS"; // 7_DAYS, 15_DAYS, NON_RETURNABLE

    public String getReturnPolicy() { return returnPolicy; }
    public void setReturnPolicy(String returnPolicy) { this.returnPolicy = returnPolicy; }
}