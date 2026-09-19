package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.entity.*;
import com.shopstack.shopstack_backend.service.WarehouseService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouse")
@CrossOrigin(origins = "http://localhost:3000")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(
            WarehouseService warehouseService) {

        this.warehouseService = warehouseService;
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(
            @RequestBody Warehouse warehouse) {

        return ResponseEntity.ok(
                warehouseService.createWarehouse(warehouse)
        );
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getWarehouses() {

        return ResponseEntity.ok(
                warehouseService.getWarehouses()
        );
    }

    @PostMapping("/allocate")
    public ResponseEntity<WarehouseAllocation> allocateOrder(
            @RequestParam Long orderId,
            @RequestParam Long warehouseId) {

        return ResponseEntity.ok(
                warehouseService.allocateOrder(
                        orderId,
                        warehouseId
                )
        );
    }

    @PutMapping("/allocations/{id}/status")
    public ResponseEntity<WarehouseAllocation> updateStatus(
            @PathVariable Long id,
            @RequestParam WarehouseStatus status) {

        return ResponseEntity.ok(
                warehouseService.updateStatus(
                        id,
                        status
                )
        );
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<WarehouseAllocation>>
    getAllocations() {

        return ResponseEntity.ok(
                warehouseService.getAllocations()
        );
    }
}