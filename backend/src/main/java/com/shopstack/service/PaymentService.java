package com.shopstack.service;

import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentStatusResponse;
import com.shopstack.dto.VerifyPaymentRequest;

public interface PaymentService {

    PaymentOrderResponse createPaymentOrder(String customerEmail);

    PaymentOrderResponse createPaymentOrder(String customerEmail, String couponCode);

    OrderDTO verifyAndPlaceOrder(String customerEmail, VerifyPaymentRequest request);

    PaymentStatusResponse getPaymentStatusByOrderId(Long orderId);

    void recordPaymentCancellation(String customerEmail, String razorpayOrderId);
}
