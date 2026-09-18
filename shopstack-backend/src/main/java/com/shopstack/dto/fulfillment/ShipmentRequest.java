package com.shopstack.dto.fulfillment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipmentRequest {
    @NotBlank
    private String carrier;

    @NotBlank
    private String trackingNumber;
}
