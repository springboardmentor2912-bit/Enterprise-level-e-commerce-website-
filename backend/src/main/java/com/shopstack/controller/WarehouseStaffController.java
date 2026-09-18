package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse-staff")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('WAREHOUSE_STAFF', 'ADMIN')")
public class WarehouseStaffController {

    private final WarehouseService warehouseService;

    public WarehouseStaffController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    private WarehouseStaffDTO getStaffProfile(Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Unauthenticated user.");
        }
        return warehouseService.getStaffProfile(principal.getName());
    }

    @GetMapping("/me")
    public ResponseEntity<WarehouseStaffDTO> getMyProfile(Principal principal) {
        return ResponseEntity.ok(getStaffProfile(principal));
    }

    @GetMapping("/warehouses")
    public ResponseEntity<List<WarehouseDTO>> getActiveWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/inventory")
    public ResponseEntity<List<WarehouseInventoryDTO>> getWarehouseInventory(Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        if (staff.getWarehouseId() != null) {
            return ResponseEntity.ok(warehouseService.getWarehouseInventory(staff.getWarehouseId()));
        }
        return ResponseEntity.ok(warehouseService.getAllWarehouseInventory());
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<WarehouseOrderAllocationDTO>> getStaffAllocations(Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        if (staff.getWarehouseId() != null) {
            return ResponseEntity.ok(warehouseService.getAllocationsByWarehouse(staff.getWarehouseId()));
        }
        // Admin or staff without specific warehouse sees all
        return ResponseEntity.ok(warehouseService.getAllAllocations());
    }

    @GetMapping("/allocated-orders")
    public ResponseEntity<List<OrderDTO>> getStaffAllocatedOrders(Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        if (staff.getWarehouseId() != null) {
            return ResponseEntity.ok(warehouseService.getStaffOrders(staff.getWarehouseId()));
        }
        return ResponseEntity.ok(warehouseService.getStaffOrders(null));
    }

    @PutMapping("/allocations/{id}/pick")
    public ResponseEntity<WarehouseOrderAllocationDTO> pickAllocation(@PathVariable Long id, Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        return ResponseEntity.ok(warehouseService.pickAllocation(id, staff.getWarehouseId()));
    }

    @PutMapping("/allocations/{id}/pack")
    public ResponseEntity<WarehouseOrderAllocationDTO> packAllocation(@PathVariable Long id, Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        return ResponseEntity.ok(warehouseService.packAllocation(id, staff.getWarehouseId()));
    }

    @PutMapping("/allocations/{id}/ready-for-shipment")
    public ResponseEntity<WarehouseOrderAllocationDTO> readyForShipmentAllocation(@PathVariable Long id, Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        return ResponseEntity.ok(warehouseService.readyForShipmentAllocation(id, staff.getWarehouseId()));
    }

    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementLogDTO>> getStockMovements(Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        if (staff.getWarehouseId() != null) {
            return ResponseEntity.ok(warehouseService.getStockMovementLogsByWarehouse(staff.getWarehouseId()));
        }
        return ResponseEntity.ok(warehouseService.getStockMovementLogs());
    }

    @GetMapping("/analytics")
    public ResponseEntity<WarehouseAnalyticsDTO> getWarehouseAnalytics() {
        return ResponseEntity.ok(warehouseService.getWarehouseAnalytics());
    }

    @GetMapping("/returns")
    public ResponseEntity<List<ReturnRequestDTO>> getStaffReturns(Principal principal) {
        WarehouseStaffDTO staff = getStaffProfile(principal);
        return ResponseEntity.ok(warehouseService.getStaffReturns(staff.getWarehouseId()));
    }

    @PostMapping("/returns/{id}/qc")
    @PreAuthorize("hasRole('WAREHOUSE_STAFF')")
    public ResponseEntity<ReturnRequestDTO> processStaffQC(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody WarehouseQCRequestDto request,
            Principal principal) {
        if (principal == null) {
            throw new IllegalStateException("Unauthenticated user.");
        }
        return ResponseEntity.ok(warehouseService.processStaffQC(id, principal.getName(), request));
    }
}
