package com.shopstack.controller;

import com.shopstack.dto.*;
import com.shopstack.model.StockMovementStage;
import com.shopstack.service.OrderService;
import com.shopstack.service.WarehouseService;
import com.shopstack.model.Order;
import com.shopstack.repository.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final OrderRepository orderRepository;

    public WarehouseController(WarehouseService warehouseService, OrderRepository orderRepository) {
        this.warehouseService = warehouseService;
        this.orderRepository = orderRepository;
    }

    // ==========================================
    // 1. Warehouse Management
    // ==========================================

    @GetMapping
    public ResponseEntity<List<WarehouseDTO>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarehouseDTO> getWarehouseById(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getWarehouseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseDTO> createWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.createWarehouse(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseDTO> updateWarehouse(@PathVariable Long id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(warehouseService.updateWarehouse(id, request));
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WarehouseDTO> toggleWarehouseStatus(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.toggleWarehouseStatus(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // 2. Inventory & Stock Management
    // ==========================================

    @GetMapping("/{id}/inventory")
    public ResponseEntity<List<WarehouseInventoryDTO>> getInventoryByWarehouse(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.getInventoryByWarehouse(id));
    }

    @GetMapping("/inventory/all")
    public ResponseEntity<List<WarehouseInventoryDTO>> getAllInventory() {
        return ResponseEntity.ok(warehouseService.getAllInventory());
    }

    @GetMapping("/availability")
    public ResponseEntity<List<WarehouseInventoryDTO>> checkProductAvailability(
            @RequestParam Long productId,
            @RequestParam(required = false, defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(warehouseService.checkAvailability(productId, quantity));
    }

    @PostMapping("/{id}/inventory/restock")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<WarehouseInventoryDTO> restockProduct(
            @PathVariable Long id,
            @Valid @RequestBody RestockRequest request) {
        return ResponseEntity.ok(warehouseService.restockProduct(id, request));
    }

    // ==========================================
    // 3. Order Warehouse Allocation
    // ==========================================

    @GetMapping("/allocations")
    public ResponseEntity<List<OrderWarehouseAllocationDTO>> getAllocations(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) StockMovementStage stage,
            @RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(warehouseService.getAllAllocations(warehouseId, stage, orderId));
    }

    @PostMapping("/allocations/auto-allocate/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<List<OrderWarehouseAllocationDTO>> autoAllocateOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));
        return ResponseEntity.ok(warehouseService.allocateOrder(order));
    }

    @PostMapping("/allocations/manual-allocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderWarehouseAllocationDTO> manualAllocate(@Valid @RequestBody ManualAllocationRequest request) {
        return ResponseEntity.ok(warehouseService.manualAllocateOrderItem(request));
    }

    // ==========================================
    // 4. Fulfillment Workflow: Pick -> Pack -> Prepare Shipment -> Dispatch
    // ==========================================

    @PostMapping("/allocations/{id}/pick")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF', 'VENDOR')")
    public ResponseEntity<OrderWarehouseAllocationDTO> pickItem(
            @PathVariable Long id,
            @RequestBody(required = false) PickRequest request) {
        PickRequest req = request != null ? request : new PickRequest();
        return ResponseEntity.ok(warehouseService.pickOrderItem(id, req));
    }

    @PostMapping("/allocations/{id}/pack")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF', 'VENDOR')")
    public ResponseEntity<OrderWarehouseAllocationDTO> packItem(
            @PathVariable Long id,
            @RequestBody(required = false) PackRequest request) {
        PackRequest req = request != null ? request : new PackRequest();
        return ResponseEntity.ok(warehouseService.packOrderItem(id, req));
    }

    @PostMapping("/allocations/{id}/prepare-shipment")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF', 'VENDOR')")
    public ResponseEntity<OrderWarehouseAllocationDTO> prepareShipment(
            @PathVariable Long id,
            @RequestBody(required = false) ShipmentPreparationRequest request) {
        ShipmentPreparationRequest req = request != null ? request : new ShipmentPreparationRequest();
        return ResponseEntity.ok(warehouseService.prepareShipment(id, req));
    }

    @PostMapping("/allocations/{id}/dispatch")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF', 'VENDOR')")
    public ResponseEntity<OrderWarehouseAllocationDTO> dispatchItem(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.dispatchShipment(id));
    }

    @PostMapping("/allocations/{id}/deliver")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF', 'VENDOR')")
    public ResponseEntity<OrderWarehouseAllocationDTO> deliverItem(@PathVariable Long id) {
        return ResponseEntity.ok(warehouseService.deliverShipment(id));
    }

    // ==========================================
    // 5. Customer Returns & QC Inspection Endpoints
    // ==========================================

    @PostMapping("/returns/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReturnResponseDto> requestReturn(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal,
            @Valid @RequestBody ReturnRequestDto request) {
        return ResponseEntity.ok(warehouseService.requestReturn(principal.getId(), request));
    }

    @GetMapping("/returns")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF')")
    public ResponseEntity<List<ReturnResponseDto>> getAllReturns(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(warehouseService.getAllReturns(warehouseId, status));
    }

    @GetMapping("/returns/my-returns")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ReturnResponseDto>> getMyReturns(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal) {
        return ResponseEntity.ok(warehouseService.getCustomerReturns(principal.getId()));
    }

    @PostMapping("/returns/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReturnResponseDto> reviewReturn(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal,
            @Valid @RequestBody ReturnReviewDto reviewDto) {
        return ResponseEntity.ok(warehouseService.reviewReturn(id, reviewDto, principal.getId()));
    }

    @PostMapping("/returns/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ReturnResponseDto> receiveReturnAtWarehouse(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal) {
        return ResponseEntity.ok(warehouseService.receiveReturnAtWarehouse(id, principal != null ? principal.getFullName() : "Staff"));
    }

    @PostMapping("/returns/{id}/qc-inspect")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE_STAFF')")
    public ResponseEntity<ReturnResponseDto> performQcInspection(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal,
            @Valid @RequestBody QcInspectionDto qcDto) {
        return ResponseEntity.ok(warehouseService.performQcInspection(id, qcDto, principal.getId()));
    }

    // ==========================================
    // 6. Vendor Stock Distribution to Warehouses
    // ==========================================

    @PostMapping("/vendor-stock-transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<WarehouseInventoryDTO> transferVendorStock(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.shopstack.security.UserPrincipal principal,
            @Valid @RequestBody VendorStockTransferDto dto) {
        return ResponseEntity.ok(warehouseService.transferVendorStockToWarehouse(dto, principal.getId()));
    }

    // ==========================================
    // 7. Stock Movement Audit Trail & Analytics
    // ==========================================

    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementDTO>> getStockMovements(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) StockMovementStage stage) {
        return ResponseEntity.ok(warehouseService.getStockMovements(warehouseId, productId, orderId, stage));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<WarehouseAnalyticsDTO> getWarehouseAnalytics() {
        return ResponseEntity.ok(warehouseService.getWarehouseAnalytics());
    }
}
