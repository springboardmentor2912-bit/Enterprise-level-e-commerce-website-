package com.infosys.springboard.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VendorResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String status;
}