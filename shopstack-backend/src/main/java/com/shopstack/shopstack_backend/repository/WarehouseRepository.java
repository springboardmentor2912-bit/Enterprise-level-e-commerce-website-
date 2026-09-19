package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository
        extends JpaRepository<Warehouse, Long> {
}