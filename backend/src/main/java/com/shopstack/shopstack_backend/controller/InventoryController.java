package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.InventoryHistory;
import com.shopstack.shopstack_backend.repository.InventoryHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryHistoryRepository inventoryHistoryRepository;

    public InventoryController(
            InventoryHistoryRepository inventoryHistoryRepository) {

        this.inventoryHistoryRepository =
                inventoryHistoryRepository;
    }

    // =========================
    // GET PRODUCT STOCK HISTORY
    // =========================

    @GetMapping("/history/{productId}")
    public ResponseEntity<List<InventoryHistory>> getStockHistory(
            @PathVariable Long productId) {

        return ResponseEntity.ok(
                inventoryHistoryRepository
                        .findByProductIdOrderByCreatedAtDesc(
                                productId
                        )
        );
    }
}