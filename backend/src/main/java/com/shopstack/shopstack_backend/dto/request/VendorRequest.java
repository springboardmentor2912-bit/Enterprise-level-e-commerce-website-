package com.shopstack.shopstack_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VendorRequest {

    @NotBlank
    private String businessName;

    @Email
    @NotBlank
    private String businessEmail;

    @NotBlank
    private String businessPhone;

    @NotBlank
    private String gstNumber;

    @NotBlank
    private String businessAddress;
}