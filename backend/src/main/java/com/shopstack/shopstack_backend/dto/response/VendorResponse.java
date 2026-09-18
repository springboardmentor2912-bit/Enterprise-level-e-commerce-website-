package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {

    private Long id;

    private Long userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String businessName;

    private String businessEmail;

    private String businessPhone;

    private String gstNumber;

    private String businessAddress;

    private boolean approved;
}