package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.RefundRequest;
import com.shopstack.shopstack_backend.dto.response.RefundResponse;

import java.util.List;

public interface RefundService {

    RefundResponse processRefund(
            Long orderId,
            RefundRequest request
    );

    RefundResponse getRefundById(
            Long id
    );

    RefundResponse getRefundByOrderId(
            Long orderId
    );

    List<RefundResponse> getAllRefunds();
}