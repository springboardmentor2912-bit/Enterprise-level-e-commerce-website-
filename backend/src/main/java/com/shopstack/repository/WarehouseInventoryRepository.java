package com.shopstack.repository;

import com.shopstack.model.WarehouseInventory;
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

    @Query("SELECT wi FROM WarehouseInventory wi WHERE wi.product.id = :productId AND wi.warehouse.active = true AND wi.availableStock >= :quantity ORDER BY wi.availableStock DESC")
    List<WarehouseInventory> findAvailableWarehousesForProduct(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    @Query("SELECT wi FROM WarehouseInventory wi WHERE wi.warehouse.active = true AND wi.product.id = :productId")
    List<WarehouseInventory> findActiveWarehousesForProduct(@Param("productId") Long productId);

    @Query("SELECT wi FROM WarehouseInventory wi WHERE wi.availableStock <= wi.minThreshold")
    List<WarehouseInventory> findLowStockInventories();

    @Query("SELECT SUM(wi.totalStock) FROM WarehouseInventory wi WHERE wi.warehouse.id = :warehouseId")
    Long sumTotalStockByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT SUM(wi.allocatedStock) FROM WarehouseInventory wi WHERE wi.warehouse.id = :warehouseId")
    Long sumAllocatedStockByWarehouseId(@Param("warehouseId") Long warehouseId);

    @Query("SELECT SUM(wi.availableStock) FROM WarehouseInventory wi WHERE wi.warehouse.id = :warehouseId")
    Long sumAvailableStockByWarehouseId(@Param("warehouseId") Long warehouseId);
}
