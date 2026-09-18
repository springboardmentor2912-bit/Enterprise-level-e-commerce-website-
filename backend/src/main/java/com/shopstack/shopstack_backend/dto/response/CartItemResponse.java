package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CartItemResponse {

    private Long productId;

    private String productName;

    private BigDecimal unitPrice;

    private Integer quantity;

    private BigDecimal subtotal;
}