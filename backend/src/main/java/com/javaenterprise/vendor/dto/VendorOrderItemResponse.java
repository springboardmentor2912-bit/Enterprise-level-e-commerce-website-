package com.javaenterprise.vendor.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VendorOrderItemResponse {

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal subtotal;
    private BigDecimal originalPrice;      // 🆕 product's original price
    private Integer discountPercentage;
    private String fulfillmentStatus;
}