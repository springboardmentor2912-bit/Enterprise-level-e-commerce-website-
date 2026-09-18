package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.ShipmentRequest;
import com.shopstack.shopstack_backend.dto.response.ShipmentResponse;

import java.util.List;

public interface ShipmentService {

    ShipmentResponse createShipment(
            ShipmentRequest request
    );

    ShipmentResponse getShipmentById(
            Long id
    );

    ShipmentResponse getShipmentByOrderId(
            Long orderId
    );

    List<ShipmentResponse> getAllShipments();

    ShipmentResponse updateShipmentStatus(
            Long id,
            String status
    );
}