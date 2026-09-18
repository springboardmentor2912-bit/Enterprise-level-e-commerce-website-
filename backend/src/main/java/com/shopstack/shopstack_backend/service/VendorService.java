package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.VendorRequest;
import com.shopstack.shopstack_backend.dto.response.VendorResponse;

public interface VendorService {

    VendorResponse createVendor(Long userId, VendorRequest request);

    VendorResponse getVendorByUserId(Long userId);

}