package com.shopstack.dto;

import com.shopstack.entity.ProductReview;
import java.time.LocalDateTime;

public class ProductReviewDTO {

    private Long id;
    private Long productId;
    private String customerName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public ProductReviewDTO() {
    }

    public ProductReviewDTO(ProductReview review) {
        this.id = review.getId();
        this.productId = review.getProduct() != null ? review.getProduct().getId() : null;
        this.customerName = review.getCustomer() != null ? review.getCustomer().getName() : "Anonymous";
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
