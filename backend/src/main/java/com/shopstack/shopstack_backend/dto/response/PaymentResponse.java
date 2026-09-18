package com.shopstack.shopstack_backend.dto.response;

import com.shopstack.shopstack_backend.constant.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;

    private Long orderId;

    private BigDecimal amount;

    private String currency;

    private PaymentStatus status;

    private String gateway;

    private String gatewayOrderId;

    private String gatewayPaymentId;

    private String razorpayKeyId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}