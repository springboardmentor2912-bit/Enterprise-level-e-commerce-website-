package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    private String customerEmail;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime orderDate;

    private List<OrderItemResponse> items;

    // =========================================================
    // RETURN & REFUND DETAILS
    // =========================================================

    private String returnStatus;

    private String returnReason;

    private BigDecimal refundAmount;

    private String refundTransactionId;

    private LocalDateTime returnRequestedDate;

    private LocalDateTime refundDate;
}