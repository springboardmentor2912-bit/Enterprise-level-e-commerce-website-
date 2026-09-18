package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.entity.Warehouse;
import com.infosys.springboard.authentication.service.WarehouseService;

@RestController
@RequestMapping("/warehouse")
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(
            WarehouseService warehouseService) {

        this.warehouseService = warehouseService;
    }

    // CREATE WAREHOUSE
    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(
            @RequestBody Warehouse warehouse) {

        return ResponseEntity.ok(
                warehouseService.createWarehouse(warehouse)
        );
    }

    // GET ALL WAREHOUSES
    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {

        return ResponseEntity.ok(
                warehouseService.getAllWarehouses()
        );
    }

    // GET WAREHOUSE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                warehouseService.getWarehouseById(id)
        );
    }

    // GET ACTIVE WAREHOUSES
    @GetMapping("/active")
    public ResponseEntity<List<Warehouse>> getActiveWarehouses() {

        return ResponseEntity.ok(
                warehouseService.getActiveWarehouses()
        );
    }

    // GET WAREHOUSES BY CITY
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Warehouse>> getWarehousesByCity(
            @PathVariable String city) {

        return ResponseEntity.ok(
                warehouseService.getWarehousesByCity(city)
        );
    }

    // UPDATE WAREHOUSE
    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(
            @PathVariable Long id,
            @RequestBody Warehouse warehouse) {

        return ResponseEntity.ok(
                warehouseService.updateWarehouse(
                        id,
                        warehouse
                )
        );
    }

    // DELETE WAREHOUSE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteWarehouse(
            @PathVariable Long id) {

        warehouseService.deleteWarehouse(id);

        return ResponseEntity.ok(
                "Warehouse deleted successfully"
        );
    }

    // TOGGLE ACTIVE / INACTIVE
    @PutMapping("/{id}/toggle")
    public ResponseEntity<Warehouse> toggleWarehouse(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                warehouseService.toggleWarehouse(id)
        );
    }
}