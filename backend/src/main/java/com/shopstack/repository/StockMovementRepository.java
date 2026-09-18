package com.shopstack.repository;

import com.shopstack.model.StockMovement;
import com.shopstack.model.StockMovementStage;
import com.shopstack.model.StockMovementType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByCreatedAtDesc();

    List<StockMovement> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<StockMovement> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<StockMovement> findByStageOrderByCreatedAtDesc(StockMovementStage stage);

    List<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovementType movementType);

    List<StockMovement> findTop100ByOrderByCreatedAtDesc();
}
