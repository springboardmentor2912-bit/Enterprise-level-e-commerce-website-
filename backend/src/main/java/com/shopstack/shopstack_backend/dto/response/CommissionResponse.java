package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommissionResponse {

    private Long vendorId;

    private String businessName;

    private BigDecimal totalSales;

    private BigDecimal commission;

    private BigDecimal vendorEarnings;
}