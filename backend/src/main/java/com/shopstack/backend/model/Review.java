package com.shopstack.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long productId;
    private Long userId;
    private String reviewerName;
    private int rating; // 1 to 5
    private String comment;
    private String date;

    @jakarta.persistence.Column(columnDefinition = "TEXT")
    private String imageUrl;

    public Review() {}

    public Review(Long productId, Long userId, String reviewerName, int rating, String comment, String date) {
        this.productId = productId;
        this.userId = userId;
        this.reviewerName = reviewerName;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
    }

    public Review(Long productId, Long userId, String reviewerName, int rating, String comment, String date, String imageUrl) {
        this.productId = productId;
        this.userId = userId;
        this.reviewerName = reviewerName;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
