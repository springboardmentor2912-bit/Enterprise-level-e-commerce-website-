package com.shopstack.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    private String label;

    @NotBlank
    private String addressLine1;
    private String addressLine2;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String postalCode;

    @NotBlank
    private String country;

    private String contactPhone;
    private boolean isDefault;
}
