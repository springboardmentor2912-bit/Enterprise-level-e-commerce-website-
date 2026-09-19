package com.shopstack.backend.repository;

import com.shopstack.backend.entity.StockMovement;
import com.shopstack.backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByWarehouseOrderByCreatedAtDesc(Warehouse warehouse);
}
