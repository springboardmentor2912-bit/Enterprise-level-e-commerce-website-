package com.shopstack.backend.controller;

import com.shopstack.backend.model.InboundShipment;
import com.shopstack.backend.service.InboundShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inbound-shipments")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class InboundShipmentController {

    @Autowired
    private InboundShipmentService inboundShipmentService;

    // --- VENDOR ENDPOINTS ---

    @PostMapping("/vendor/{vendorId}/create")
    public ResponseEntity<?> createInboundShipment(@PathVariable Long vendorId, @RequestBody Map<String, Object> payload) {
        try {
            Long productId = Long.parseLong(payload.get("productId").toString());
            Long warehouseId = Long.parseLong(payload.get("warehouseId").toString());
            int declaredQty = Integer.parseInt(payload.get("declaredQuantity").toString());
            String courier = payload.getOrDefault("courierPartner", "ShopStack Express").toString();
            String tracking = payload.getOrDefault("trackingNumber", "").toString();
            String notes = payload.getOrDefault("vendorNotes", "").toString();

            InboundShipment shipment = inboundShipmentService.createInboundShipment(vendorId, productId, warehouseId, declaredQty, courier, tracking, notes);
            return ResponseEntity.ok(shipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<InboundShipment>> getVendorShipments(@PathVariable Long vendorId) {
        return ResponseEntity.ok(inboundShipmentService.getVendorShipments(vendorId));
    }

    @PostMapping("/{shipmentId}/mark-shipped")
    public ResponseEntity<?> markShipmentShipped(@PathVariable Long shipmentId, @RequestBody Map<String, String> payload) {
        try {
            String courier = payload.getOrDefault("courierPartner", "ShopStack Express");
            String tracking = payload.getOrDefault("trackingNumber", "TRK-" + System.currentTimeMillis());
            InboundShipment shipment = inboundShipmentService.markShipmentDispatched(shipmentId, courier, tracking);
            return ResponseEntity.ok(shipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- WAREHOUSE RECEIVING & QC ENDPOINTS ---

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<InboundShipment>> getWarehouseShipments(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(inboundShipmentService.getWarehouseShipments(warehouseId));
    }

    @PostMapping("/{shipmentId}/receive-and-grn")
    public ResponseEntity<?> receiveAndGenerateGRN(@PathVariable Long shipmentId) {
        try {
            InboundShipment shipment = inboundShipmentService.receiveAndGenerateGRN(shipmentId);
            return ResponseEntity.ok(shipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{shipmentId}/verify-qc")
    public ResponseEntity<?> verifyQcInspection(@PathVariable Long shipmentId, @RequestBody Map<String, Object> payload) {
        try {
            int receivedQty = Integer.parseInt(payload.getOrDefault("receivedQuantity", 0).toString());
            int damagedQty = Integer.parseInt(payload.getOrDefault("damagedQuantity", 0).toString());
            String staffNotes = payload.getOrDefault("staffInspectionNotes", "").toString();

            InboundShipment shipment = inboundShipmentService.performQcVerification(shipmentId, receivedQty, damagedQty, staffNotes);
            return ResponseEntity.ok(shipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{shipmentId}/shelve-bin")
    public ResponseEntity<?> shelveStockInBin(@PathVariable Long shipmentId, @RequestBody Map<String, String> payload) {
        try {
            String binLocation = payload.getOrDefault("binLocation", "BIN-A1-01");
            InboundShipment shipment = inboundShipmentService.shelveStockIntoBin(shipmentId, binLocation);
            return ResponseEntity.ok(shipment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADMIN OVERVIEW ENDPOINT ---

    @GetMapping("/all")
    public ResponseEntity<List<InboundShipment>> getAllShipments() {
        return ResponseEntity.ok(inboundShipmentService.getAllShipments());
    }
}
