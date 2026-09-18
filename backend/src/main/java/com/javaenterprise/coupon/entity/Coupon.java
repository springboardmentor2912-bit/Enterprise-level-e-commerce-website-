package com.javaenterprise.coupon.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DiscountType discountType = DiscountType.PERCENTAGE;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;   // 20 = 20% OR ₹20

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    private LocalDate expiryDate;       // null = never expires

    private Integer usageLimit;         // null = unlimited

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private boolean active = true;

    private String description;

    private LocalDate startDate; // 🆕

    @Column(precision = 10, scale = 2)
    private BigDecimal maxDiscount; // 🆕
}