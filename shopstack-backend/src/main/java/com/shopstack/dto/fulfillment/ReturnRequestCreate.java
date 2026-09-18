package com.shopstack.dto.fulfillment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReturnRequestCreate {
    @NotBlank(message = "Please tell us why you're returning this order")
    private String reason;
}
