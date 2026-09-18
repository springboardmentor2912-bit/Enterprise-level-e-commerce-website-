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
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String carrier;
    private String trackingNumber;
    private String status;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDelivery;
}
