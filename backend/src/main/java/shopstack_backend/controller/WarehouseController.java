package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.*;
import shopstack_backend.entity.AllocationStatus;
import shopstack_backend.service.WarehouseService;

import java.util.List;

/**
 * Admin-only warehouse & fulfillment endpoints. Sits under /api/admin/**,
 * which SecurityConfig already restricts to hasRole('ADMINISTRATOR'),
 * so no per-method @PreAuthorize is needed here.
 */
@RestController
@RequestMapping("/api/admin/warehouses")
@CrossOrigin(origins = "http://localhost:5173")
public class WarehouseController {

    @Autowired
    private WarehouseService warehouseService;

    // ---- Warehouse management ----

    @PostMapping
    public ResponseEntity<?> createWarehouse(@RequestBody WarehouseRequestDTO request) {
        try {
            return ResponseEntity.ok(warehouseService.createWarehouse(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateWarehouse(@PathVariable Long id, @RequestBody WarehouseRequestDTO request) {
        try {
            return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWarehouse(@PathVariable Long id) {
        try {
            warehouseService.deleteWarehouse(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<WarehouseResponseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    // ---- Stock receiving ----

    @PostMapping("/{id}/stock")
    public ResponseEntity<?> receiveStock(@PathVariable Long id, @RequestBody WarehouseStockRequestDTO request) {
        try {
            return ResponseEntity.ok(warehouseService.receiveStock(id, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/stock")
    public ResponseEntity<List<WarehouseStockResponseDTO>> getWarehouseStock(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseStock(id));
    }

    // Stock of one product across every warehouse — powers the admin's
    // "which warehouse should fulfill this?" dropdown when manually
    // allocating an order item.
    @GetMapping("/products/{productId}/stock")
    public ResponseEntity<List<WarehouseStockResponseDTO>> getStockForProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(warehouseService.getStockForProduct(productId));
    }

    // ---- Fulfillment queues: pick list, pack list, ready-to-ship list ----

    @GetMapping("/{id}/queue/{status}")
    public ResponseEntity<?> getQueue(@PathVariable Long id, @PathVariable String status) {
        try {
            AllocationStatus allocationStatus = AllocationStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(warehouseService.getWarehouseQueue(id, allocationStatus));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    "\"" + status + "\" is not a valid stage. Use ALLOCATED, PICKED, PACKED, or READY_FOR_SHIPMENT.");
        }
    }

    // Note: there is deliberately no automatic/algorithmic allocation
    // endpoint here. Every item is allocated one way only — an admin
    // manually choosing its warehouse below. Nothing allocates stock on
    // an admin's behalf, whether at checkout or by loading this screen.

    // Admin manually chooses which warehouse (and how much) fulfills a
    // specific order item.
    @PostMapping("/order-items/{orderItemId}/allocate")
    public ResponseEntity<?> manuallyAllocate(@PathVariable Long orderItemId,
                                               @RequestBody ManualAllocationRequestDTO request) {
        try {
            return ResponseEntity.ok(
                    warehouseService.manuallyAllocate(orderItemId, request.getWarehouseId(), request.getQuantity()));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Note: pick / pack / ready-for-shipment are deliberately NOT exposed
    // here. Per the fulfillment workflow, once an order is allocated to a
    // warehouse, only that warehouse's own staff (WarehouseStaffController,
    // /api/warehouse-staff/**) can pick, pack, and mark it ready. Admin's
    // job stops at allocation and oversight (queues/movements below).

    // ---- Per-order fulfillment view + movement history ----

    @GetMapping("/orders/{orderId}/allocations")
    public ResponseEntity<List<StockAllocationResponseDTO>> getAllocationsForOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(warehouseService.getAllocationsForOrder(orderId));
    }

    @GetMapping("/{id}/movements")
    public ResponseEntity<List<StockMovementResponseDTO>> getWarehouseMovements(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseMovements(id));
    }
}