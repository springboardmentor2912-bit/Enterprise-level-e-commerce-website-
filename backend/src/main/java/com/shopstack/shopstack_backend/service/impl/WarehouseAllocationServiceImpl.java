package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.WarehouseAllocationRequest;
import com.shopstack.shopstack_backend.dto.response.WarehouseAllocationResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Warehouse;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.WarehouseRepository;
import com.shopstack.shopstack_backend.service.WarehouseAllocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WarehouseAllocationServiceImpl
        implements WarehouseAllocationService {

    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;

    public WarehouseAllocationServiceImpl(
            OrderRepository orderRepository,
            WarehouseRepository warehouseRepository) {

        this.orderRepository = orderRepository;
        this.warehouseRepository =
                warehouseRepository;
    }

    // =========================
    // ALLOCATE ORDER
    // =========================

    @Override
    @Transactional
    public WarehouseAllocationResponse
    allocateOrderToWarehouse(
            Long orderId,
            WarehouseAllocationRequest request) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        Warehouse warehouse =
                warehouseRepository.findById(
                                request.getWarehouseId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"
                                )
                        );

        // =========================
        // CHECK WAREHOUSE STATUS
        // =========================

        if (!warehouse.isActive()) {

            throw new RuntimeException(
                    "Cannot allocate order to an inactive warehouse"
            );
        }

        // =========================
        // ALLOCATE ORDER
        // =========================

        order.setWarehouse(warehouse);

        orderRepository.save(order);

        return new WarehouseAllocationResponse(
                order.getId(),
                warehouse.getId(),
                warehouse.getWarehouseName(),
                warehouse.isActive()
        );
    }
}