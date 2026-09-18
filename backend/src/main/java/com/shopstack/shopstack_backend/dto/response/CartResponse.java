package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class CartResponse {

    private Long cartId;

    private List<CartItemResponse> items;

    private BigDecimal totalAmount;
}