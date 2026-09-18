package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShipmentRequest {

    @NotNull
    private Long orderId;

    @NotBlank
    private String courierName;
}