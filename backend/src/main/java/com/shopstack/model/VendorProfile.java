package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_profiles")
public class VendorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String storeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;

    @Enumerated(EnumType.STRING)
    private VendorStatus status = VendorStatus.PENDING;

    private Double commissionRate = 10.0;

    private Double rating = 5.0;

    private LocalDateTime createdAt;

    public VendorProfile() {}

    public VendorProfile(Long id, User user, String storeName, String description, String logoUrl, VendorStatus status, Double commissionRate, Double rating, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.storeName = storeName;
        this.description = description;
        this.logoUrl = logoUrl;
        this.status = status != null ? status : VendorStatus.PENDING;
        this.commissionRate = commissionRate != null ? commissionRate : 10.0;
        this.rating = rating != null ? rating : 5.0;
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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public VendorStatus getStatus() { return status; }
    public void setStatus(VendorStatus status) { this.status = status; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static VendorProfileBuilder builder() {
        return new VendorProfileBuilder();
    }

    public static class VendorProfileBuilder {
        private Long id;
        private User user;
        private String storeName;
        private String description;
        private String logoUrl;
        private VendorStatus status = VendorStatus.PENDING;
        private Double commissionRate = 10.0;
        private Double rating = 5.0;
        private LocalDateTime createdAt;

        public VendorProfileBuilder id(Long id) { this.id = id; return this; }
        public VendorProfileBuilder user(User user) { this.user = user; return this; }
        public VendorProfileBuilder storeName(String storeName) { this.storeName = storeName; return this; }
        public VendorProfileBuilder description(String description) { this.description = description; return this; }
        public VendorProfileBuilder logoUrl(String logoUrl) { this.logoUrl = logoUrl; return this; }
        public VendorProfileBuilder status(VendorStatus status) { this.status = status; return this; }
        public VendorProfileBuilder commissionRate(Double commissionRate) { this.commissionRate = commissionRate; return this; }
        public VendorProfileBuilder rating(Double rating) { this.rating = rating; return this; }
        public VendorProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public VendorProfile build() {
            return new VendorProfile(id, user, storeName, description, logoUrl, status, commissionRate, rating, createdAt);
        }
    }
}
