package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.request.WarehouseAllocationRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.WarehouseAllocationResponse;
import com.shopstack.shopstack_backend.service.WarehouseAllocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/warehouse-allocation")
@PreAuthorize("hasRole('ADMIN')")
public class WarehouseAllocationController {

    private final WarehouseAllocationService
            warehouseAllocationService;

    public WarehouseAllocationController(
            WarehouseAllocationService warehouseAllocationService) {

        this.warehouseAllocationService =
                warehouseAllocationService;
    }

    // =========================
    // ALLOCATE ORDER TO WAREHOUSE
    // =========================

    @PutMapping("/orders/{orderId}")
    public ResponseEntity<
            ApiResponse<WarehouseAllocationResponse>>
    allocateOrderToWarehouse(
            @PathVariable Long orderId,
            @Valid @RequestBody
            WarehouseAllocationRequest request) {

        System.out.println(
                "===== ALLOCATE ORDER TO WAREHOUSE API HIT ====="
        );

        WarehouseAllocationResponse response =
                warehouseAllocationService
                        .allocateOrderToWarehouse(
                                orderId,
                                request
                        );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Allocated To Warehouse Successfully",
                        response
                )
        );
    }
}