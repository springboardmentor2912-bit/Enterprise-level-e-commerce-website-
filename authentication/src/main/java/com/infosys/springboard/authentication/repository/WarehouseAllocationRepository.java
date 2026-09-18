package com.infosys.springboard.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.WarehouseAllocation;

@Repository
public interface WarehouseAllocationRepository
        extends JpaRepository<WarehouseAllocation, Long> {

    Optional<WarehouseAllocation> findByOrderId(Long orderId);

    List<WarehouseAllocation> findByWarehouseId(Long warehouseId);

    List<WarehouseAllocation> findByStatus(String status);
}