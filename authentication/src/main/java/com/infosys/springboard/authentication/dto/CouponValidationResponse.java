package com.infosys.springboard.authentication.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {

    private boolean valid;

    private String message;

    private String code;

    private BigDecimal discountAmount;

    private BigDecimal finalAmount;
}