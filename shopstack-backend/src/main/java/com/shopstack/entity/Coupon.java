package com.shopstack.entity;

import com.shopstack.enums.DiscountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private BigDecimal discountValue; // percentage (0-100) or a flat amount, depending on discountType

    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscountAmount; // caps a PERCENTAGE discount; ignored for FIXED_AMOUNT

    private Integer usageLimit; // null = unlimited
    @Builder.Default
    private Integer usedCount = 0;

    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    @Builder.Default
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Transient
    public boolean isCurrentlyValid() {
        LocalDateTime now = LocalDateTime.now();
        if (!active) return false;
        if (validFrom != null && now.isBefore(validFrom)) return false;
        if (validTo != null && now.isAfter(validTo)) return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        return true;
    }
}
