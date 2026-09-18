package com.shopstack.shopstack_backend.entity;

import com.shopstack.shopstack_backend.constant.ProductStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private String brand;

    @Column(length = 1000)
    private String description;

    // Original product price
    @Column(nullable = false)
    private BigDecimal price;

    // Discount percentage
    @Column(nullable = false)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    // Price after applying discount
    @Column(nullable = false)
    private BigDecimal finalPrice;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;
}