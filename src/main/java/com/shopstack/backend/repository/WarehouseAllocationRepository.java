package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.Warehouse;
import com.shopstack.backend.entity.WarehouseAllocation;
import com.shopstack.backend.enums.WarehouseAllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WarehouseAllocationRepository extends JpaRepository<WarehouseAllocation, Long> {
    Optional<WarehouseAllocation> findByOrder(Order order);
    List<WarehouseAllocation> findByWarehouseOrderByAllocatedAtDesc(Warehouse warehouse);
    List<WarehouseAllocation> findByStatusOrderByAllocatedAtDesc(WarehouseAllocationStatus status);
    long countByStatus(WarehouseAllocationStatus status);
}
