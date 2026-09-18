package com.infosys.auth.repository;

import com.infosys.auth.model.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findAllByOrderByCreatedAtDesc();

    List<StockMovement> findByWarehouseIdOrderByCreatedAtDesc(Long warehouseId);

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<StockMovement> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<StockMovement> findTop100ByOrderByCreatedAtDesc();
}
