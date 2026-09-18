package com.javaenterprise.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserResponse {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String address;

    private String role;

    private boolean enabled;
}