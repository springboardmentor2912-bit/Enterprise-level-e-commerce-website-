package com.shopstack.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorCommissionSummary {
    private BigDecimal grossRevenue;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private BigDecimal netEarnings;
}
