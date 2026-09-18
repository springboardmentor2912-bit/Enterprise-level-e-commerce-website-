package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.CustomerRequest;
import com.shopstack.shopstack_backend.dto.response.CustomerResponse;

public interface CustomerService {

    CustomerResponse createCustomer(Long userId, CustomerRequest request);

    CustomerResponse getCustomerByUserId(Long userId);

}