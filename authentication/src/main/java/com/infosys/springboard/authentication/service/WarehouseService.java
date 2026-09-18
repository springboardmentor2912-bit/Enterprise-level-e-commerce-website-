package com.infosys.springboard.authentication.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.entity.Warehouse;
import com.infosys.springboard.authentication.repository.WarehouseRepository;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(
            WarehouseRepository warehouseRepository) {

        this.warehouseRepository = warehouseRepository;
    }

    public Warehouse createWarehouse(Warehouse warehouse) {

        warehouse.setId(null);

        if (warehouse.getActive() == null) {
            warehouse.setActive(true);
        }

        warehouse.setCreatedAt(LocalDateTime.now());

        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehouses() {

        return warehouseRepository.findAll();
    }

    public Warehouse getWarehouseById(Long id) {

        return warehouseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Warehouse not found"));
    }

    public List<Warehouse> getActiveWarehouses() {

        return warehouseRepository.findByActive(true);
    }

    public List<Warehouse> getWarehousesByCity(
            String city) {

        return warehouseRepository.findByCity(city);
    }

    public Warehouse updateWarehouse(
            Long id,
            Warehouse updatedWarehouse) {

        Warehouse warehouse =
                warehouseRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"));

        warehouse.setWarehouseName(
                updatedWarehouse.getWarehouseName());

        warehouse.setLocation(
                updatedWarehouse.getLocation());

        warehouse.setAddress(
                updatedWarehouse.getAddress());

        warehouse.setCity(
                updatedWarehouse.getCity());

        warehouse.setState(
                updatedWarehouse.getState());

        warehouse.setPostalCode(
                updatedWarehouse.getPostalCode());

        warehouse.setContactNumber(
                updatedWarehouse.getContactNumber());

        warehouse.setManagerName(
                updatedWarehouse.getManagerName());

        if (updatedWarehouse.getActive() != null) {
            warehouse.setActive(
                    updatedWarehouse.getActive());
        }

        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(Long id) {

        Warehouse warehouse =
                warehouseRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"));

        warehouseRepository.delete(warehouse);
    }

    public Warehouse toggleWarehouse(Long id) {

        Warehouse warehouse =
                warehouseRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse not found"));

        warehouse.setActive(
                !Boolean.TRUE.equals(
                        warehouse.getActive()));

        return warehouseRepository.save(warehouse);
    }
}