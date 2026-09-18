package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    // ─── Warehouse Management ──────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    public ResponseEntity<WarehouseDTO> createWarehouse(@RequestBody CreateWarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.createWarehouse(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @RequestBody CreateWarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<WarehouseDTO> toggleWarehouseStatus(@PathVariable Long id, @RequestParam Boolean active) {
        return ResponseEntity.ok(warehouseService.toggleWarehouseStatus(id, active));
    }

    // ─── Staff Management (Admin) ──────────────────────────────────────────────

    @GetMapping("/staff")
    public ResponseEntity<List<WarehouseStaffDTO>> getWarehouseStaff() {
        return ResponseEntity.ok(warehouseService.getWarehouseStaff());
    }

    @PostMapping("/staff")
    public ResponseEntity<WarehouseStaffDTO> createWarehouseStaff(@RequestBody CreateWarehouseStaffRequest request) {
        return ResponseEntity.ok(warehouseService.createWarehouseStaff(request));
    }

    @PutMapping("/staff/{staffId}/warehouse")
    public ResponseEntity<WarehouseStaffDTO> assignStaffToWarehouse(
            @PathVariable Long staffId,
            @RequestParam Long warehouseId) {
        return ResponseEntity.ok(warehouseService.assignStaffToWarehouse(staffId, warehouseId));
    }

    // ─── Inventory ─────────────────────────────────────────────────────────────

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<WarehouseInventoryDTO>> getWarehouseInventory(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseInventory(id));
    }

    @GetMapping("/inventory/all")
    public ResponseEntity<List<WarehouseInventoryDTO>> getAllWarehouseInventory() {
        return ResponseEntity.ok(warehouseService.getAllWarehouseInventory());
    }

    @PostMapping("/{id}/inventory")
    public ResponseEntity<WarehouseInventoryDTO> addOrUpdateStock(
            @PathVariable Long id,
            @RequestBody UpdateWarehouseStockRequest request) {
        return ResponseEntity.ok(warehouseService.addOrUpdateInventoryStock(id, request));
    }

    // ─── Order Allocations (Admin Only) ───────────────────────────────────────

    @GetMapping("/unallocated-orders")
    public ResponseEntity<List<OrderDTO>> getUnallocatedOrders() {
        return ResponseEntity.ok(warehouseService.getUnallocatedOrders());
    }

    @GetMapping("/allocations")
    public ResponseEntity<List<WarehouseOrderAllocationDTO>> getAllAllocations() {
        return ResponseEntity.ok(warehouseService.getAllAllocations());
    }

    @PostMapping("/allocate")
    public ResponseEntity<List<WarehouseOrderAllocationDTO>> allocateOrder(@RequestBody AllocateOrderRequest request) {
        return ResponseEntity.ok(warehouseService.allocateOrder(request));
    }

    @PostMapping("/auto-allocate/{orderId}")
    public ResponseEntity<List<WarehouseOrderAllocationDTO>> autoAllocateOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(warehouseService.autoAllocateOrderIfPossible(orderId));
    }

    @GetMapping("/suitable-warehouses/{orderId}")
    public ResponseEntity<List<WarehouseDTO>> getSuitableWarehouses(@PathVariable Long orderId) {
        return ResponseEntity.ok(warehouseService.getSuitableWarehousesForOrder(orderId));
    }

    // ─── Stock Movement Logs & Analytics ──────────────────────────────────────

    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementLogDTO>> getStockMovementLogs() {
        return ResponseEntity.ok(warehouseService.getStockMovementLogs());
    }

    @GetMapping("/analytics")
    public ResponseEntity<WarehouseAnalyticsDTO> getWarehouseAnalytics() {
        return ResponseEntity.ok(warehouseService.getWarehouseAnalytics());
    }
}
