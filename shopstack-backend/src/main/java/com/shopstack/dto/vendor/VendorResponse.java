package com.shopstack.dto.vendor;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {
    private Long id;
    private String businessName;
    private String businessDescription;
    private String approvalStatus;
    private BigDecimal commissionRate;
    private String ownerEmail;
}
