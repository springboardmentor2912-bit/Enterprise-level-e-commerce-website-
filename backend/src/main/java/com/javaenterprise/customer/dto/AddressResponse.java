package com.javaenterprise.customer.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {

    private Long id;

    private String fullName;

    private String phone;

    private String addressLine;

    private String city;

    private String state;

    private String country;

    private String postalCode;

    private boolean defaultAddress;
}