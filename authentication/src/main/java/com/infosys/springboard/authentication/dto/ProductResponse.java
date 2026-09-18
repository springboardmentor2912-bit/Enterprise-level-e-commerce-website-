package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    // ==========================================
    // PRODUCT ID
    // ==========================================

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
    // Final selling price
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