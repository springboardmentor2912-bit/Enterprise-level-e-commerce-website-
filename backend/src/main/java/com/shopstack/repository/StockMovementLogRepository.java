package com.shopstack.repository;

import com.shopstack.entity.StockMovementLog;
import com.shopstack.entity.StockMovementStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementLogRepository extends JpaRepository<StockMovementLog, Long> {
    List<StockMovementLog> findAllByOrderByTimestampDesc();
    List<StockMovementLog> findByWarehouseIdOrderByTimestampDesc(Long warehouseId);
    List<StockMovementLog> findByProductIdOrderByTimestampDesc(Long productId);
    List<StockMovementLog> findByOrderIdOrderByTimestampDesc(Long orderId);
    List<StockMovementLog> findByStageOrderByTimestampDesc(StockMovementStage stage);
}
