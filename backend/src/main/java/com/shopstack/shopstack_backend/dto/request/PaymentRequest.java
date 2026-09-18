package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private String gateway;
}