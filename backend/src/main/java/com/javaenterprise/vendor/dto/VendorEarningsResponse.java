package com.javaenterprise.vendor.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class VendorEarningsResponse {
    private BigDecimal grossSales;
    private BigDecimal totalCommission;
    private BigDecimal netEarnings;
    private BigDecimal commissionRate;
    private int totalOrders;
}