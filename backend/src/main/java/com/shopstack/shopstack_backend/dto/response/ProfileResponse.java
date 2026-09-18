package com.shopstack.shopstack_backend.dto.response;

import lombok.Data;

@Data
public class ProfileResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String role;
}