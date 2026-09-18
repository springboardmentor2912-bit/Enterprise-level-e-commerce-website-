package com.shopstack.service;

import com.shopstack.dto.*;

public interface VendorService {
    VendorAuthResponse registerVendor(VendorRegisterRequest request);
    VendorAuthResponse loginVendor(VendorLoginRequest request);
    VendorDTO getVendorByEmail(String email);
    VendorAnalyticsDTO getVendorAnalytics(String email);
}
