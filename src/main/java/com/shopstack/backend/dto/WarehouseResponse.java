package com.shopstack.backend.dto;

public record WarehouseResponse(Long id, String name, String code, String address, String city, String state, String pincode, Boolean active) {}
