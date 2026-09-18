package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.WarehouseRequest;
import com.shopstack.shopstack_backend.dto.response.WarehouseResponse;
import com.shopstack.shopstack_backend.entity.Warehouse;
import com.shopstack.shopstack_backend.repository.WarehouseRepository;
import com.shopstack.shopstack_backend.service.WarehouseService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarehouseServiceImpl
        implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseServiceImpl(
            WarehouseRepository warehouseRepository) {

        this.warehouseRepository =
                warehouseRepository;
    }

    // =========================
    // CREATE WAREHOUSE
    // =========================

    @Override
    public WarehouseResponse createWarehouse(
            WarehouseRequest request) {

        if (warehouseRepository
                .existsByWarehouseName(
                        request.getWarehouseName()
                )) {

            throw new RuntimeException(
                    "Warehouse name already exists"
            );
        }

        Warehouse warehouse =
                new Warehouse();

        warehouse.setWarehouseName(
                request.getWarehouseName()
        );

        warehouse.setAddress(
                request.getAddress()
        );

        warehouse.setCity(
                request.getCity()
        );

        warehouse.setState(
                request.getState()
        );

        warehouse.setPincode(
                request.getPincode()
        );

        warehouse.setActive(true);

        Warehouse savedWarehouse =
                warehouseRepository.save(
                        warehouse
                );

        return convertToResponse(
                savedWarehouse
        );
    }

    // =========================
    // GET ALL WAREHOUSES
    // =========================

    @Override
    public List<WarehouseResponse>
    getAllWarehouses() {

        return warehouseRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================
    // GET WAREHOUSE BY ID
    // =========================

    @Override
    public WarehouseResponse getWarehouseById(
            Long id) {

        Warehouse warehouse =
                warehouseRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"
                                )
                        );

        return convertToResponse(
                warehouse
        );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    @Override
    public WarehouseResponse updateWarehouseStatus(
            Long id,
            boolean active) {

        Warehouse warehouse =
                warehouseRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"
                                )
                        );

        warehouse.setActive(active);

        Warehouse updatedWarehouse =
                warehouseRepository.save(
                        warehouse
                );

        return convertToResponse(
                updatedWarehouse
        );
    }

    // =========================
    // CONVERT TO RESPONSE
    // =========================

    private WarehouseResponse convertToResponse(
            Warehouse warehouse) {

        return new WarehouseResponse(
                warehouse.getId(),
                warehouse.getWarehouseName(),
                warehouse.getAddress(),
                warehouse.getCity(),
                warehouse.getState(),
                warehouse.getPincode(),
                warehouse.isActive()
        );
    }
}