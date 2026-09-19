package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.Shipment;
import com.shopstack.shopstack_backend.entity.ShipmentStatus;
import com.shopstack.shopstack_backend.service.ShippingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipping")
@CrossOrigin(origins = "http://localhost:3000")
public class ShippingController {

    private final ShippingService shippingService;

    public ShippingController(
            ShippingService shippingService) {

        this.shippingService = shippingService;
    }

    @PostMapping("/create")
    public ResponseEntity<Shipment> createShipment(
            @RequestParam Long orderId,
            @RequestParam String courierName) {

        return ResponseEntity.ok(
                shippingService.createShipment(
                        orderId,
                        courierName
                )
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateTracking(
            @PathVariable Long id,
            @RequestParam ShipmentStatus status) {

        return ResponseEntity.ok(
                shippingService.updateTracking(
                        id,
                        status
                )
        );
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipment> getShipment(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                shippingService.getShipment(orderId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {

        return ResponseEntity.ok(
                shippingService.getAllShipments()
        );
    }
}