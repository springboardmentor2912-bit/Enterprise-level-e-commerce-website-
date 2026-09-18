package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarehouseRepository
        extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findByActiveTrue();

    boolean existsByWarehouseName(String warehouseName);
}