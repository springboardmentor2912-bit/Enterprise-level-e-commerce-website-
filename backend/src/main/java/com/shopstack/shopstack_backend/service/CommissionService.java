package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.CommissionResponse;

import java.util.List;

public interface CommissionService {

    List<CommissionResponse> getCommissionReport();
}