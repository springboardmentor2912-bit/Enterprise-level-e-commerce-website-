package com.shopstack.dto.vendor;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PriceUpdateRequest {
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private BigDecimal discountPrice;
}
