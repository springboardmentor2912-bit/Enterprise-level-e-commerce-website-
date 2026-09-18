package com.shopstack.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private List<String> images;
    private String categoryName;
    private Long categoryId;
    private String vendorName;
    private Long vendorId;
    private String approvalStatus;
    private boolean active;
    private Double averageRating;
    private Integer reviewCount;
    private Integer availableStock;
    private LocalDateTime createdAt;
}
