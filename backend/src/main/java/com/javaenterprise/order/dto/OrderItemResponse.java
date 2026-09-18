package com.javaenterprise.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;

    private String productName;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal subtotal;
    private String fulfillmentStatus;
}