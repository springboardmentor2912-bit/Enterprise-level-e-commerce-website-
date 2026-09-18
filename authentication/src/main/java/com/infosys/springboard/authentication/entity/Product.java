package com.infosys.springboard.authentication.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    // ==========================================
    // PRODUCT ID
    // ==========================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ==========================================
    // PRODUCT NAME
    // ==========================================

    private String name;


    // ==========================================
    // PRODUCT CATEGORY
    // ==========================================

    private String category;


    // ==========================================
    // PRODUCT BRAND
    // ==========================================

    private String brand;


    // ==========================================
    // PRODUCT DESCRIPTION
    // ==========================================

    private String description;


    // ==========================================
    // ORIGINAL PRODUCT PRICE
    // ==========================================

    private BigDecimal originalPrice;


    // ==========================================
    // DISCOUNT PERCENTAGE
    // ==========================================

    private BigDecimal discountPercentage;


    // ==========================================
    // PRODUCT PRICE
    // ==========================================

    private BigDecimal price;


    // ==========================================
    // STOCK QUANTITY
    // ==========================================

    private Integer quantity;


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    private String imageUrl;


    // ==========================================
    // VENDOR EMAIL
    // ==========================================

    private String vendorEmail;
}