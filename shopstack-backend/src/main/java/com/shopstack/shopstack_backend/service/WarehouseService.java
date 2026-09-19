package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.entity.*;
import com.shopstack.shopstack_backend.repository.*;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseAllocationRepository allocationRepository;
    private final OrderRepository orderRepository;

    public WarehouseService(
            WarehouseRepository warehouseRepository,
            WarehouseAllocationRepository allocationRepository,
            OrderRepository orderRepository) {

        this.warehouseRepository = warehouseRepository;
        this.allocationRepository = allocationRepository;
        this.orderRepository = orderRepository;
    }

    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getWarehouses() {
        return warehouseRepository.findAll();
    }

    public WarehouseAllocation allocateOrder(
            Long orderId,
            Long warehouseId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        Warehouse warehouse =
                warehouseRepository.findById(warehouseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"));

        WarehouseAllocation allocation =
                allocationRepository
                        .findByOrderId(orderId)
                        .orElse(new WarehouseAllocation());

        allocation.setOrder(order);
        allocation.setWarehouse(warehouse);
        allocation.setStatus(
                WarehouseStatus.ALLOCATED
        );

        return allocationRepository.save(allocation);
    }

    public WarehouseAllocation updateStatus(
            Long allocationId,
            WarehouseStatus status) {

        WarehouseAllocation allocation =
                allocationRepository.findById(allocationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Allocation not found"));

        allocation.setStatus(status);

        return allocationRepository.save(allocation);
    }

    public List<WarehouseAllocation> getAllocations() {
        return allocationRepository.findAll();
    }
}