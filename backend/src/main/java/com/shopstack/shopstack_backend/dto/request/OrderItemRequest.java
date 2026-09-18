package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderItemRequest {

    @NotNull
    private Long productId;

    @NotBlank
    private String productName;

    @NotNull
    private Double price;

    @NotNull
    @Min(1)
    private Integer quantity;
}