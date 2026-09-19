package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.WarehouseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WarehouseAllocationRepository
        extends JpaRepository<WarehouseAllocation, Long> {

    Optional<WarehouseAllocation> findByOrderId(Long orderId);
}