package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {

    private Long id;

    private Long orderId;

    private Double refundAmount;

    private String reason;

    private String status;

    private LocalDateTime refundedAt;
}