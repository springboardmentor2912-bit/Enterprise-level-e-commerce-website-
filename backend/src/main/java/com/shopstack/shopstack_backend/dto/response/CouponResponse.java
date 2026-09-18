package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {

    private Long id;

    private String code;

    private String description;

    private Double discountPercentage;

    private Double minimumOrderAmount;

    private LocalDateTime startDate;

    private LocalDateTime expiryDate;

    private Integer usageLimit;

    private Integer usedCount;

    private boolean active;
}