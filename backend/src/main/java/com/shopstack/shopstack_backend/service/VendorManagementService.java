package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.VendorResponse;

import java.util.List;

public interface VendorManagementService {

    List<VendorResponse> getAllVendors();

    VendorResponse getVendorById(Long id);
}