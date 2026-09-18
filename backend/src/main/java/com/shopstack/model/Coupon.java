package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false)
    private Double discountValue;

    private Double minOrderAmount;

    private Double maxDiscountAmount;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private Integer usageLimit;

    @Column(nullable = false)
    private Integer userUsageLimit = 1;

    @Column(nullable = false)
    private Integer usageCount = 0;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Coupon() {}

    public Coupon(Long id, String code, String description, DiscountType discountType, Double discountValue,
                  Double minOrderAmount, Double maxDiscountAmount, LocalDateTime startDate, LocalDateTime expiryDate,
                  Integer usageLimit, Integer userUsageLimit, Integer usageCount, Boolean active,
                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.code = code != null ? code.trim().toUpperCase() : null;
        this.description = description;
        this.discountType = discountType != null ? discountType : DiscountType.PERCENTAGE;
        this.discountValue = discountValue;
        this.minOrderAmount = minOrderAmount;
        this.maxDiscountAmount = maxDiscountAmount;
        this.startDate = startDate;
        this.expiryDate = expiryDate;
        this.usageLimit = usageLimit;
        this.userUsageLimit = userUsageLimit != null ? userUsageLimit : 1;
        this.usageCount = usageCount != null ? usageCount : 0;
        this.active = active != null ? active : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
        if (this.usageCount == null) {
            this.usageCount = 0;
        }
        if (this.active == null) {
            this.active = true;
        }
        if (this.userUsageLimit == null) {
            this.userUsageLimit = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.code != null) {
            this.code = this.code.trim().toUpperCase();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code != null ? code.trim().toUpperCase() : null; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public Double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public Double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }

    public Integer getUserUsageLimit() { return userUsageLimit; }
    public void setUserUsageLimit(Integer userUsageLimit) { this.userUsageLimit = userUsageLimit; }

    public Integer getUsageCount() { return usageCount; }
    public void setUsageCount(Integer usageCount) { this.usageCount = usageCount; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static CouponBuilder builder() {
        return new CouponBuilder();
    }

    public static class CouponBuilder {
        private Long id;
        private String code;
        private String description;
        private DiscountType discountType = DiscountType.PERCENTAGE;
        private Double discountValue;
        private Double minOrderAmount;
        private Double maxDiscountAmount;
        private LocalDateTime startDate;
        private LocalDateTime expiryDate;
        private Integer usageLimit;
        private Integer userUsageLimit = 1;
        private Integer usageCount = 0;
        private Boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CouponBuilder id(Long id) { this.id = id; return this; }
        public CouponBuilder code(String code) { this.code = code; return this; }
        public CouponBuilder description(String description) { this.description = description; return this; }
        public CouponBuilder discountType(DiscountType discountType) { this.discountType = discountType; return this; }
        public CouponBuilder discountValue(Double discountValue) { this.discountValue = discountValue; return this; }
        public CouponBuilder minOrderAmount(Double minOrderAmount) { this.minOrderAmount = minOrderAmount; return this; }
        public CouponBuilder maxDiscountAmount(Double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; return this; }
        public CouponBuilder startDate(LocalDateTime startDate) { this.startDate = startDate; return this; }
        public CouponBuilder expiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; return this; }
        public CouponBuilder usageLimit(Integer usageLimit) { this.usageLimit = usageLimit; return this; }
        public CouponBuilder userUsageLimit(Integer userUsageLimit) { this.userUsageLimit = userUsageLimit; return this; }
        public CouponBuilder usageCount(Integer usageCount) { this.usageCount = usageCount; return this; }
        public CouponBuilder active(Boolean active) { this.active = active; return this; }
        public CouponBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CouponBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Coupon build() {
            return new Coupon(id, code, description, discountType, discountValue, minOrderAmount, maxDiscountAmount,
                    startDate, expiryDate, usageLimit, userUsageLimit, usageCount, active, createdAt, updatedAt);
        }
    }
}
