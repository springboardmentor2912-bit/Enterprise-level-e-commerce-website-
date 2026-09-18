package com.infosys.springboard.authentication.controller;

import com.infosys.springboard.authentication.entity.Inventory;
import com.infosys.springboard.authentication.service.InventoryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vendor/stock")
@CrossOrigin(origins = "http://localhost:5173")
public class VendorStockController {

    private final InventoryService inventoryService;

    public VendorStockController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // Get all stock belonging to logged-in vendor
    @GetMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Inventory>> getVendorStock() {

        return ResponseEntity.ok(
                inventoryService.getVendorInventory()
        );
    }

    // Get stock for one product
    @GetMapping("/{productId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Inventory> getProductStock(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                inventoryService.getInventoryByProductId(productId)
        );
    }

    // Set exact stock quantity
    @PutMapping("/{productId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Inventory> updateStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request) {

        Integer quantity = request.get("quantity");

        return ResponseEntity.ok(
                inventoryService.updateStock(
                        productId,
                        quantity
                )
        );
    }

    // Increase stock
    @PutMapping("/{productId}/increase")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Inventory> increaseStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request) {

        Integer amount = request.get("quantity");

        return ResponseEntity.ok(
                inventoryService.increaseStock(
                        productId,
                        amount
                )
        );
    }

    // Decrease stock
    @PutMapping("/{productId}/decrease")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Inventory> decreaseStock(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> request) {

        Integer amount = request.get("quantity");

        return ResponseEntity.ok(
                inventoryService.decreaseStock(
                        productId,
                        amount
                )
        );
    }
}