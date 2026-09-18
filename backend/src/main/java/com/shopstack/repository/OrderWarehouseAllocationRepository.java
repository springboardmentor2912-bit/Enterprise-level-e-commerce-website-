package com.shopstack.repository;

import com.shopstack.model.OrderWarehouseAllocation;
import com.shopstack.model.StockMovementStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderWarehouseAllocationRepository extends JpaRepository<OrderWarehouseAllocation, Long> {

    List<OrderWarehouseAllocation> findByOrderId(Long orderId);

    List<OrderWarehouseAllocation> findByWarehouseId(Long warehouseId);

    List<OrderWarehouseAllocation> findByStage(StockMovementStage stage);

    List<OrderWarehouseAllocation> findByWarehouseIdAndStage(Long warehouseId, StockMovementStage stage);

    List<OrderWarehouseAllocation> findAllByOrderByCreatedAtDesc();

    long countByStage(StockMovementStage stage);

    Optional<OrderWarehouseAllocation> findByOrderItemId(Long orderItemId);
}
