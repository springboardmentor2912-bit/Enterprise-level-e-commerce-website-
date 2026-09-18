package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {

    private Long id;

    private Long orderId;

    private Long warehouseId;

    private String warehouseName;

    private String trackingNumber;

    private String courierName;

    private String status;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;
}