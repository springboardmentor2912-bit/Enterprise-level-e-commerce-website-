package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.PaymentRequest;
import com.shopstack.shopstack_backend.dto.response.PaymentResponse;

public interface PaymentService {

    PaymentResponse createPayment(PaymentRequest request);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse verifyPayment(
            Long paymentId,
            String paymentOrderId,
            String paymentReference,
            String signature
    );

    PaymentResponse updatePaymentStatus(
            Long paymentId,
            String status
    );
}