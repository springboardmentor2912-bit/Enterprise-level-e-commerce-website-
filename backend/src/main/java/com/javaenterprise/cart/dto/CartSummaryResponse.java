package com.javaenterprise.cart.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartSummaryResponse {

    private List<CartResponse> items;

    private BigDecimal totalAmount;

    private Integer totalItems;
}