package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.WarehouseRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.WarehouseResponse;
import com.shopstack.shopstack_backend.service.WarehouseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
@PreAuthorize("hasRole('ADMIN')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(
            WarehouseService warehouseService) {

        this.warehouseService =
                warehouseService;
    }

    // =========================
    // CREATE WAREHOUSE
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<WarehouseResponse>>
    createWarehouse(
            @Valid @RequestBody WarehouseRequest request) {

        System.out.println(
                "===== CREATE WAREHOUSE API HIT ====="
        );

        WarehouseResponse response =
                warehouseService.createWarehouse(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse Created Successfully",
                        response
                )
        );
    }

    // =========================
    // GET ALL WAREHOUSES
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<WarehouseResponse>>>
    getAllWarehouses() {

        System.out.println(
                "===== GET ALL WAREHOUSES API HIT ====="
        );

        List<WarehouseResponse> warehouses =
                warehouseService.getAllWarehouses();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouses Retrieved Successfully",
                        warehouses
                )
        );
    }

    // =========================
    // GET WAREHOUSE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WarehouseResponse>>
    getWarehouseById(
            @PathVariable Long id) {

        WarehouseResponse response =
                warehouseService.getWarehouseById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // UPDATE WAREHOUSE STATUS
    // =========================

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WarehouseResponse>>
    updateWarehouseStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        System.out.println(
                "===== UPDATE WAREHOUSE STATUS API HIT ====="
        );

        WarehouseResponse response =
                warehouseService.updateWarehouseStatus(
                        id,
                        active
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse Status Updated Successfully",
                        response
                )
        );
    }
}