package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.ShipmentRequest;
import com.infosys.springboard.authentication.entity.Shipment;
import com.infosys.springboard.authentication.service.ShipmentService;

@RestController
@RequestMapping("/warehouse/shipments")
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    // =========================================================
    // CREATE SHIPMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<Shipment> createShipment(
            @RequestBody ShipmentRequest request) {

        return ResponseEntity.ok(
                shipmentService.createShipment(request)
        );
    }

    // =========================================================
    // GET ALL SHIPMENTS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {

        return ResponseEntity.ok(
                shipmentService.getAllShipments()
        );
    }

    // =========================================================
    // GET SHIPMENT BY ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Shipment> getShipmentByOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                shipmentService.getShipmentByOrderId(orderId)
        );
    }

    // =========================================================
    // GET SHIPMENT BY TRACKING NUMBER
    // =========================================================

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<Shipment> getShipmentByTracking(
            @PathVariable String trackingNumber) {

        return ResponseEntity.ok(
                shipmentService.getByTrackingNumber(trackingNumber)
        );
    }

    // =========================================================
    // GET SHIPMENTS BY WAREHOUSE
    // =========================================================

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Shipment>> getShipmentsByWarehouse(
            @PathVariable Long warehouseId) {

        return ResponseEntity.ok(
                shipmentService.getByWarehouse(warehouseId)
        );
    }

    // =========================================================
    // GET SHIPMENTS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Shipment>> getShipmentsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                shipmentService.getByStatus(status)
        );
    }

    // =========================================================
    // GET SHIPMENT BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Shipment> getShipmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.getShipmentById(id)
        );
    }

    // =========================================================
    // UPDATE SHIPMENT STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateShipmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                shipmentService.updateStatus(
                        id,
                        status,
                        remarks
                )
        );
    }
}