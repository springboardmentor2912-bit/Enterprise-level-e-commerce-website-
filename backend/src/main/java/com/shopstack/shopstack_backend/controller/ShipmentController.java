package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.ShipmentRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.ShipmentResponse;
import com.shopstack.shopstack_backend.service.ShipmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/shipments")
@PreAuthorize("hasRole('ADMIN')")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(
            ShipmentService shipmentService) {

        this.shipmentService = shipmentService;
    }

    // =========================
    // CREATE SHIPMENT
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<ShipmentResponse>>
    createShipment(
            @Valid @RequestBody ShipmentRequest request) {

        System.out.println(
                "===== CREATE SHIPMENT API HIT ====="
        );

        ShipmentResponse response =
                shipmentService.createShipment(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Shipment Created Successfully",
                        response
                )
        );
    }

    // =========================
    // GET ALL SHIPMENTS
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShipmentResponse>>>
    getAllShipments() {

        List<ShipmentResponse> shipments =
                shipmentService.getAllShipments();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Shipments Retrieved Successfully",
                        shipments
                )
        );
    }

    // =========================
    // GET SHIPMENT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShipmentResponse>>
    getShipmentById(
            @PathVariable Long id) {

        ShipmentResponse response =
                shipmentService.getShipmentById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Shipment Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // GET SHIPMENT BY ORDER
    // =========================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<ShipmentResponse>>
    getShipmentByOrderId(
            @PathVariable Long orderId) {

        ShipmentResponse response =
                shipmentService.getShipmentByOrderId(
                        orderId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Shipment Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // UPDATE SHIPMENT STATUS
    // =========================

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ShipmentResponse>>
    updateShipmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        ShipmentResponse response =
                shipmentService.updateShipmentStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Shipment Status Updated Successfully",
                        response
                )
        );
    }
}