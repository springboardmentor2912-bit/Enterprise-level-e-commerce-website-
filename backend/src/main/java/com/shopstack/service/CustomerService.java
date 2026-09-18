package com.shopstack.service;

import com.shopstack.dto.*;

public interface CustomerService {
    AuthResponse registerCustomer(RegisterRequest request);
    AuthResponse loginCustomer(LoginRequest request);
    CustomerDTO getProfileByEmail(String email);
    CustomerDTO updateProfile(String email, UpdateProfileRequest request);
    CustomerDTO getCustomerById(Long id);
}
