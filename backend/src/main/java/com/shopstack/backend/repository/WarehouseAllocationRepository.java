package com.shopstack.backend.repository;

import com.shopstack.backend.model.WarehouseAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WarehouseAllocationRepository extends JpaRepository<WarehouseAllocation, Long> {
    List<WarehouseAllocation> findByOrderId(String orderId);
    List<WarehouseAllocation> findByStatus(String status);
    List<WarehouseAllocation> findByWarehouseId(Long warehouseId);
}
