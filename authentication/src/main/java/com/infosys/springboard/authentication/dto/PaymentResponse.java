package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;

    private Long orderId;

    private String customerEmail;

    private BigDecimal amount;

    private String paymentMethod;

    private String paymentStatus;

    private String transactionId;

    private LocalDateTime paymentDate;
}