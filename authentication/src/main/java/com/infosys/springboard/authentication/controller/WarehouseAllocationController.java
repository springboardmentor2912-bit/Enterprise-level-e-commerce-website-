package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.WarehouseAllocationRequest;
import com.infosys.springboard.authentication.entity.WarehouseAllocation;
import com.infosys.springboard.authentication.service.WarehouseAllocationService;

@RestController
@RequestMapping("/warehouse/allocations")
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
public class WarehouseAllocationController {

    private final WarehouseAllocationService allocationService;

    public WarehouseAllocationController(
            WarehouseAllocationService allocationService) {

        this.allocationService = allocationService;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public ResponseEntity<WarehouseAllocation> createAllocation(
            @RequestBody WarehouseAllocationRequest request) {

        return ResponseEntity.ok(
                allocationService.createAllocation(request));
    }

    // =========================================================
    // GET ALL
    // =========================================================

    @GetMapping
    public ResponseEntity<List<WarehouseAllocation>> getAllAllocations() {

        return ResponseEntity.ok(
                allocationService.getAllAllocations());
    }

    // =========================================================
    // GET BY ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<WarehouseAllocation> getByOrder(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                allocationService.getAllocationByOrderId(orderId));
    }

    // =========================================================
    // GET BY WAREHOUSE
    // =========================================================

    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<WarehouseAllocation>> getByWarehouse(
            @PathVariable Long warehouseId) {

        return ResponseEntity.ok(
                allocationService
                        .getAllocationsByWarehouse(warehouseId));
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<WarehouseAllocation>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                allocationService
                        .getAllocationsByStatus(status));
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseAllocation> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                allocationService.getAllocationById(id));
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<WarehouseAllocation> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "") String remarks) {

        return ResponseEntity.ok(
                allocationService.updateStatus(
                        id,
                        status,
                        remarks));
    }
}