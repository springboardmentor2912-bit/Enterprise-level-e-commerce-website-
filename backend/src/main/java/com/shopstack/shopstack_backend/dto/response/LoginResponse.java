package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;

    private String tokenType;

    private String email;

    private String role;
}