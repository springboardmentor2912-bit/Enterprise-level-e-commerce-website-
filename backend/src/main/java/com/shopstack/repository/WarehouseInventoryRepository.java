package com.shopstack.repository;

import com.shopstack.entity.WarehouseInventory;
import com.shopstack.entity.WarehouseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {
    Optional<WarehouseInventory> findByWarehouseIdAndProductId(Long warehouseId, Long productId);
    List<WarehouseInventory> findByWarehouseId(Long warehouseId);
    List<WarehouseInventory> findByProductId(Long productId);

    @Query("SELECT wi FROM WarehouseInventory wi WHERE wi.product.id = :productId AND wi.warehouse.status = :status AND wi.availableQuantity >= :requiredQty")
    List<WarehouseInventory> findAvailableStockForProduct(
            @Param("productId") Long productId,
            @Param("status") WarehouseStatus status,
            @Param("requiredQty") Integer requiredQty
    );
}
