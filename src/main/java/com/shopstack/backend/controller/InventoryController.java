package com.shopstack.backend.controller;

import com.shopstack.backend.dto.InventoryResponse;
import com.shopstack.backend.dto.InventorySummaryResponse;
import com.shopstack.backend.dto.StockUpdateRequest;
import com.shopstack.backend.service.InventoryService;
import com.shopstack.backend.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private JwtService jwtService;

    // View Inventory
    @GetMapping
    public List<InventoryResponse> getInventory(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return inventoryService.getInventory(email);
    }

    // Add Stock
    @PutMapping("/{id}/add")
    public String addStock(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody StockUpdateRequest request) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return inventoryService.addStock(id, email, request);
    }

    // Update Stock
    @PutMapping("/{id}")
    public String updateStock(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader,
            @RequestBody StockUpdateRequest request) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return inventoryService.updateStock(id, email, request);
    }

    // Inventory Summary
    @GetMapping("/summary")
    public InventorySummaryResponse getSummary(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);

        return inventoryService.getSummary(email);
    }
}