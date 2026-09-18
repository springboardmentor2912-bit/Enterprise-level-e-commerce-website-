package com.infosys.springboard.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.entity.Shipment;
import com.infosys.springboard.authentication.repository.ShipmentRepository;

@RestController
@RequestMapping("/customer/orders")
public class CustomerShipmentController {

    private final ShipmentRepository shipmentRepository;

    public CustomerShipmentController(
            ShipmentRepository shipmentRepository) {

        this.shipmentRepository = shipmentRepository;
    }

    @GetMapping("/{orderId}/shipment")
    public ResponseEntity<?> getShipmentByOrder(
            @PathVariable Long orderId) {

        return shipmentRepository
                .findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }
}