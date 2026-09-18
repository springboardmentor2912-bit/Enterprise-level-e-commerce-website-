package com.infosys.springboard.authentication.dto;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    @NotEmpty(message = "Order must contain at least one product")
    private List<OrderItemRequest> items;

    private String couponCode;

    // ============================
    // DELIVERY ADDRESS
    // ============================

    private Long addressId;

    // ============================
    // PAYMENT METHOD
    // ============================

    private String paymentMethod;
}