package com.shopstack.dto.fulfillment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String reason;
    private String status;
    private String adminNotes;
    private LocalDateTime requestedAt;
    private LocalDateTime resolvedAt;
}
