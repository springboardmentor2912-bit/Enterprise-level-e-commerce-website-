package com.infosys.springboard.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockResponse {

    private Long productId;

    private String productName;

    private Integer quantity;

    private String status;
}