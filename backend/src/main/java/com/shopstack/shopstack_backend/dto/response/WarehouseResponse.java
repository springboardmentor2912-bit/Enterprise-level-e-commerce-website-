package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseResponse {

    private Long id;

    private String warehouseName;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private boolean active;
}