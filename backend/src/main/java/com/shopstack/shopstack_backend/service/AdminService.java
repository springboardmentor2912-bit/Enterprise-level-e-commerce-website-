package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.VendorResponse;

public interface AdminService {

    VendorResponse approveVendor(Long vendorId);

    VendorResponse rejectVendor(Long vendorId);
}