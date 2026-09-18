package com.shopstack.controller;

import com.shopstack.dto.CreateShipmentRequest;
import com.shopstack.dto.ShipmentDTO;
import com.shopstack.dto.UpdateShipmentStatusRequest;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "*")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    /**
     * POST /api/shipments/order/{orderId}
     * Admin creates a shipment for an order marked READY_FOR_SHIPPING.
     */
    @PostMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> createShipment(
            @PathVariable Long orderId,
            @RequestBody(required = false) CreateShipmentRequest request) {
        ShipmentDTO result = shipmentService.createShipment(orderId, request);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    /**
     * PUT /api/shipments/{id}/status
     * Admin updates shipment status (SHIPMENT_CREATED -> SHIPPED -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED).
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShipmentDTO> updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {
        ShipmentDTO result = shipmentService.updateShipmentStatus(id, request);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/shipments/order/{orderId}
     * Customer, Admin, or Warehouse Staff views shipment tracking for an order.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ShipmentDTO> getShipmentByOrderId(@PathVariable Long orderId) {
        try {
            ShipmentDTO result = shipmentService.getShipmentByOrderId(orderId);
            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/shipments/tracking/{trackingId}
     * Public or customer tracking lookup by tracking ID.
     */
    @GetMapping("/tracking/{trackingId}")
    public ResponseEntity<ShipmentDTO> getShipmentByTrackingId(@PathVariable String trackingId) {
        try {
            ShipmentDTO result = shipmentService.getShipmentByTrackingId(trackingId);
            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/shipments/all
     * Admin views all shipments.
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ShipmentDTO>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }
}
