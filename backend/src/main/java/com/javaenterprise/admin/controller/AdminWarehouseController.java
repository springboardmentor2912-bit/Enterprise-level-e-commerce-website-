package com.javaenterprise.admin.controller;

import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.entity.WarehouseInventory;
import com.javaenterprise.warehouse.repository.WarehouseInventoryRepository;
import com.javaenterprise.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
@RequiredArgsConstructor
public class AdminWarehouseController {

    private final WarehouseRepository warehouseRepo;
    private final WarehouseInventoryRepository inventoryRepo;

    // 1. Admin views all warehouses
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseRepo.findAll());
    }

    // 2. Admin views inventory inside a specific warehouse
    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<WarehouseInventory>> getWarehouseInventory(@PathVariable Long id) {
        // You might need to add this method to your WarehouseInventoryRepository if it doesn't exist:
        // List<WarehouseInventory> findByWarehouseId(Long warehouseId);
        return ResponseEntity.ok(inventoryRepo.findByWarehouseId(id));
    }
}