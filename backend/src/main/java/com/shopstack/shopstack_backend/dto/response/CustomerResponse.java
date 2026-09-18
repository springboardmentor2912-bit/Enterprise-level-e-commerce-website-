package com.shopstack.shopstack_backend.dto.response;

import lombok.Data;

@Data
public class CustomerResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String address;

    private String city;

    private String state;

    private String country;

    private String pincode;
}