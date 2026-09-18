package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;

    public Review() {}

    public Review(Long id, Product product, User user, Integer rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ReviewBuilder builder() {
        return new ReviewBuilder();
    }

    public static class ReviewBuilder {
        private Long id;
        private Product product;
        private User user;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;

        public ReviewBuilder id(Long id) { this.id = id; return this; }
        public ReviewBuilder product(Product product) { this.product = product; return this; }
        public ReviewBuilder user(User user) { this.user = user; return this; }
        public ReviewBuilder rating(Integer rating) { this.rating = rating; return this; }
        public ReviewBuilder comment(String comment) { this.comment = comment; return this; }
        public ReviewBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Review build() {
            return new Review(id, product, user, rating, comment, createdAt);
        }
    }
}
