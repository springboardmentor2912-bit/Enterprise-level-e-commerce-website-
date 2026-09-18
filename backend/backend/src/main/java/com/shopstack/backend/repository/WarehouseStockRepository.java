package com.shopstack.backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.shopstack.backend.entity.WarehouseStock;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    List<WarehouseStock> findByProductId(Long productId);
    Optional<WarehouseStock> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
}
