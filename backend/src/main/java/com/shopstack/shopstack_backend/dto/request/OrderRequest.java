package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {

    @NotBlank
    private String customerName;

    @NotBlank
    private String phone;

    @NotBlank
    private String address;

    @NotBlank
    private String city;

    @NotBlank
    private String state;

    @NotBlank
    private String pincode;

    private String couponCode;
}