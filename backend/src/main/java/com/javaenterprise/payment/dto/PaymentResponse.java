package com.javaenterprise.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long paymentId;
    private String transactionId;

    // ✅ ADD THESE TWO FIELDS for Razorpay:
    private String razorpayOrderId;
    private Integer amountInPaise;

    private BigDecimal amount;
    private String status;
    private String keyId;
    private String paymentMethod;
    private LocalDateTime createdAt;
}