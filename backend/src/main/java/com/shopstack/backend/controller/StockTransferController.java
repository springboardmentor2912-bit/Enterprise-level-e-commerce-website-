package com.shopstack.backend.controller;

import com.shopstack.backend.model.StockTransfer;
import com.shopstack.backend.service.StockTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-transfers")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class StockTransferController {

    @Autowired
    private StockTransferService stockTransferService;

    @PostMapping("/create")
    public ResponseEntity<?> createTransfer(@RequestBody Map<String, Object> payload) {
        try {
            Long sourceWarehouseId = (payload.containsKey("sourceWarehouseId") && payload.get("sourceWarehouseId") != null && !payload.get("sourceWarehouseId").toString().isEmpty() && !"VENDOR".equals(payload.get("sourceWarehouseId").toString()))
                    ? Long.parseLong(payload.get("sourceWarehouseId").toString())
                    : null;
            Long destinationWarehouseId = Long.parseLong(payload.get("destinationWarehouseId").toString());
            Long productId = Long.parseLong(payload.get("productId").toString());
            int quantity = Integer.parseInt(payload.get("quantity").toString());
            String reason = payload.getOrDefault("transferReason", "REGIONAL_REBALANCE").toString();
            String notes = payload.getOrDefault("notes", "").toString();

            StockTransfer transfer = stockTransferService.createTransfer(sourceWarehouseId, destinationWarehouseId, productId, quantity, reason, notes);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<StockTransfer>> getAllTransfers() {
        return ResponseEntity.ok(stockTransferService.getAllTransfers());
    }

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<StockTransfer>> getWarehouseTransfers(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(stockTransferService.getTransfersForWarehouse(warehouseId));
    }

    @PostMapping("/{transferId}/dispatch")
    public ResponseEntity<?> dispatchTransfer(@PathVariable Long transferId, @RequestBody Map<String, String> payload) {
        try {
            String courier = payload.getOrDefault("courierPartner", "ShopStack Express");
            String tracking = payload.getOrDefault("trackingNumber", "TRK-TRF-" + System.currentTimeMillis());

            StockTransfer transfer = stockTransferService.dispatchTransfer(transferId, courier, tracking);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{transferId}/receive")
    public ResponseEntity<?> receiveAndShelveTransfer(@PathVariable Long transferId, @RequestBody Map<String, String> payload) {
        try {
            String binLocation = payload.getOrDefault("binLocation", "BIN-TRANSFER-01");
            StockTransfer transfer = stockTransferService.receiveAndShelveTransfer(transferId, binLocation);
            return ResponseEntity.ok(transfer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
