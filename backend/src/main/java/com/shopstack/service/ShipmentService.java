package com.shopstack.service;

import com.shopstack.dto.CreateShipmentRequest;
import com.shopstack.dto.ShipmentDTO;
import com.shopstack.dto.UpdateShipmentStatusRequest;

import java.util.List;

public interface ShipmentService {
    ShipmentDTO createShipment(Long orderId, CreateShipmentRequest request);
    ShipmentDTO updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request);
    ShipmentDTO getShipmentByOrderId(Long orderId);
    ShipmentDTO getShipmentByTrackingId(String trackingId);
    List<ShipmentDTO> getAllShipments();
}
