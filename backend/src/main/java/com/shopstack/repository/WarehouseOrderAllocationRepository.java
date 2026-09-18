package com.shopstack.repository;

import com.shopstack.entity.WarehouseAllocationStatus;
import com.shopstack.entity.WarehouseOrderAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WarehouseOrderAllocationRepository extends JpaRepository<WarehouseOrderAllocation, Long> {
    List<WarehouseOrderAllocation> findByOrderId(Long orderId);
    List<WarehouseOrderAllocation> findByWarehouseId(Long warehouseId);
    List<WarehouseOrderAllocation> findByStatus(WarehouseAllocationStatus status);
    List<WarehouseOrderAllocation> findAllByOrderByCreatedAtDesc();
    List<WarehouseOrderAllocation> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);
}

