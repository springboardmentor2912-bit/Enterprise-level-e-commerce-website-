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
public class OrderItemResponse {

    private Long id;

    private Long productId;

    private String productName;

    private String imageUrl;

    private String vendorEmail;

    private Integer quantity;

    private BigDecimal price;

    private BigDecimal subtotal;
}