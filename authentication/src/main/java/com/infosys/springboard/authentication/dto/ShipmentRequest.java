package com.infosys.springboard.authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentRequest {

    private Long orderId;

    private Long warehouseId;

    private String trackingNumber;

    private String carrier;

    private String remarks;
}