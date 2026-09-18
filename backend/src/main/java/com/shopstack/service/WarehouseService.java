package com.shopstack.service;

import com.shopstack.dto.*;

import java.util.List;

public interface WarehouseService {
    WarehouseDTO createWarehouse(CreateWarehouseRequest request);
    WarehouseDTO updateWarehouse(Long id, CreateWarehouseRequest request);
    WarehouseDTO toggleWarehouseStatus(Long id, Boolean active);
    List<WarehouseDTO> getAllWarehouses();
    WarehouseDTO getWarehouseById(Long id);

    List<WarehouseInventoryDTO> getWarehouseInventory(Long warehouseId);
    List<WarehouseInventoryDTO> getAllWarehouseInventory();
    WarehouseInventoryDTO addOrUpdateInventoryStock(Long warehouseId, UpdateWarehouseStockRequest request);

    // Admin: allocate confirmed orders to a warehouse
    List<WarehouseOrderAllocationDTO> allocateOrder(AllocateOrderRequest request);
    List<WarehouseOrderAllocationDTO> autoAllocateOrderIfPossible(Long orderId);
    List<WarehouseOrderAllocationDTO> getAllAllocations();
    List<OrderDTO> getUnallocatedOrders();
    List<WarehouseDTO> getSuitableWarehousesForOrder(Long orderId);

    // Staff: warehouse-scoped operations
    List<WarehouseOrderAllocationDTO> getAllocationsByWarehouse(Long warehouseId);
    List<OrderDTO> getStaffOrders(Long warehouseId);
    WarehouseOrderAllocationDTO pickAllocation(Long allocationId, Long staffWarehouseId);
    WarehouseOrderAllocationDTO packAllocation(Long allocationId, Long staffWarehouseId);
    WarehouseOrderAllocationDTO readyForShipmentAllocation(Long allocationId, Long staffWarehouseId);

    List<StockMovementLogDTO> getStockMovementLogs();
    List<StockMovementLogDTO> getStockMovementLogsByWarehouse(Long warehouseId);
    WarehouseAnalyticsDTO getWarehouseAnalytics();

    // Staff: Return & QC operations
    List<ReturnRequestDTO> getStaffReturns(Long warehouseId);
    ReturnRequestDTO processStaffQC(Long returnId, String staffEmail, WarehouseQCRequestDto request);
    ReturnRequestDTO processStaffQC(Long returnId, Long staffWarehouseId, AdminReceiveReturnRequest request);

    // Staff management (admin-only)
    List<WarehouseStaffDTO> getWarehouseStaff();
    WarehouseStaffDTO createWarehouseStaff(CreateWarehouseStaffRequest request);
    WarehouseStaffDTO assignStaffToWarehouse(Long staffId, Long warehouseId);
    WarehouseStaffDTO getStaffProfile(String email);
}

