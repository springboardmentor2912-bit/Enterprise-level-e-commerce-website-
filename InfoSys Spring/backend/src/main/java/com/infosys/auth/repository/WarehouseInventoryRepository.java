package com.infosys.auth.repository;

import com.infosys.auth.model.WarehouseInventory;
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

    @Query("SELECT wi FROM WarehouseInventory wi WHERE wi.productId = :productId AND (wi.availableQuantity - wi.reservedQuantity) >= :qty ORDER BY (wi.availableQuantity - wi.reservedQuantity) DESC")
    List<WarehouseInventory> findWarehousesWithAvailableStock(@Param("productId") Long productId, @Param("qty") Integer qty);

    @Query("SELECT SUM(wi.availableQuantity) FROM WarehouseInventory wi WHERE wi.productId = :productId")
    Integer getTotalAvailableStockForProduct(@Param("productId") Long productId);

    @Query("SELECT SUM(wi.availableQuantity) FROM WarehouseInventory wi WHERE wi.warehouseId = :warehouseId")
    Integer getTotalStockInWarehouse(@Param("warehouseId") Long warehouseId);
}
