package com.infosys.springboard.authentication.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {

    private Long orderId;

    private String customerEmail;

    private Double amount;

    private String reason;
}