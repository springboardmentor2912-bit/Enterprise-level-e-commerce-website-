package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long productId;

    private String productName;

    private Double price;

    private Integer quantity;

    private Double subtotal;
}