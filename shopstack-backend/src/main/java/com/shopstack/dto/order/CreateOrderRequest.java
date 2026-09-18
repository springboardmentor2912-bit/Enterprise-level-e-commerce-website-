package com.shopstack.dto.order;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOrderRequest {
    @NotNull(message = "Shipping address is required")
    private Long shippingAddressId;

    private String couponCode;
}
