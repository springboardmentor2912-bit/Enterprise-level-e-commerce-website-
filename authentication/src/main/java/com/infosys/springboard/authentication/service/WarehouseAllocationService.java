package com.infosys.springboard.authentication.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.WarehouseAllocationRequest;
import com.infosys.springboard.authentication.entity.Warehouse;
import com.infosys.springboard.authentication.entity.WarehouseAllocation;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.WarehouseAllocationRepository;

@Service
public class WarehouseAllocationService {

    private final WarehouseAllocationRepository allocationRepository;
    private final OrderRepository orderRepository;
    private final WarehouseService warehouseService;

    public WarehouseAllocationService(
            WarehouseAllocationRepository allocationRepository,
            OrderRepository orderRepository,
            WarehouseService warehouseService) {

        this.allocationRepository = allocationRepository;
        this.orderRepository = orderRepository;
        this.warehouseService = warehouseService;
    }

    // =========================================================
    // CREATE ALLOCATION
    // =========================================================

    public WarehouseAllocation createAllocation(
            WarehouseAllocationRequest request) {

        if (request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }

        if (request.getWarehouseId() == null) {
            throw new RuntimeException("Warehouse ID is required");
        }

        // Check order exists
        orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        // One warehouse allocation per order
        if (allocationRepository
                .findByOrderId(request.getOrderId())
                .isPresent()) {

            throw new RuntimeException(
                    "Order is already allocated to a warehouse");
        }

        // Check warehouse exists and is active
        List<Warehouse> activeWarehouses =
                warehouseService.getActiveWarehouses();

        boolean warehouseAvailable =
                activeWarehouses.stream()
                        .anyMatch(w ->
                                w.getId().equals(request.getWarehouseId()));

        if (!warehouseAvailable) {
            throw new RuntimeException(
                    "Warehouse not found or inactive");
        }

        LocalDateTime now = LocalDateTime.now();

        WarehouseAllocation allocation =
                WarehouseAllocation.builder()
                        .orderId(request.getOrderId())
                        .warehouseId(request.getWarehouseId())
                        .status("ALLOCATED")
                        .remarks(request.getRemarks())
                        .allocatedAt(now)
                        .updatedAt(now)
                        .build();

        return allocationRepository.save(allocation);
    }

    // =========================================================
    // GET ALL
    // =========================================================

    public List<WarehouseAllocation> getAllAllocations() {
        return allocationRepository.findAll();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public WarehouseAllocation getAllocationById(Long id) {

        return allocationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Warehouse allocation not found"));
    }

    // =========================================================
    // GET BY ORDER
    // =========================================================

    public WarehouseAllocation getAllocationByOrderId(Long orderId) {

        return allocationRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No warehouse allocation found for order"));
    }

    // =========================================================
    // GET BY WAREHOUSE
    // =========================================================

    public List<WarehouseAllocation> getAllocationsByWarehouse(
            Long warehouseId) {

        return allocationRepository
                .findByWarehouseId(warehouseId);
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    public List<WarehouseAllocation> getAllocationsByStatus(
            String status) {

        return allocationRepository
                .findByStatus(status.toUpperCase());
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public WarehouseAllocation updateStatus(
            Long id,
            String status,
            String remarks) {

        WarehouseAllocation allocation =
                getAllocationById(id);

        String newStatus = status.toUpperCase();

        validateStatus(newStatus);

        validateStatusTransition(
                allocation.getStatus(),
                newStatus);

        allocation.setStatus(newStatus);

        if (remarks != null && !remarks.isBlank()) {
            allocation.setRemarks(remarks);
        }

        allocation.setUpdatedAt(LocalDateTime.now());

        return allocationRepository.save(allocation);
    }

    // =========================================================
    // STATUS VALIDATION
    // =========================================================

    private void validateStatus(String status) {

        if (!status.equals("ALLOCATED")
                && !status.equals("PROCESSING")
                && !status.equals("READY_FOR_SHIPMENT")
                && !status.equals("SHIPPED")
                && !status.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid warehouse allocation status");
        }
    }

    // =========================================================
    // STATUS TRANSITION
    // =========================================================

    private void validateStatusTransition(
            String currentStatus,
            String newStatus) {

        if (currentStatus.equals(newStatus)) {
            return;
        }

        boolean valid = false;

        switch (currentStatus) {

            case "ALLOCATED":
                valid = newStatus.equals("PROCESSING")
                        || newStatus.equals("CANCELLED");
                break;

            case "PROCESSING":
                valid = newStatus.equals("READY_FOR_SHIPMENT")
                        || newStatus.equals("CANCELLED");
                break;

            case "READY_FOR_SHIPMENT":
                valid = newStatus.equals("SHIPPED");
                break;

            case "SHIPPED":
                valid = false;
                break;

            case "CANCELLED":
                valid = false;
                break;
        }

        if (!valid) {
            throw new RuntimeException(
                    "Invalid status transition: "
                    + currentStatus
                    + " -> "
                    + newStatus);
        }
    }
}