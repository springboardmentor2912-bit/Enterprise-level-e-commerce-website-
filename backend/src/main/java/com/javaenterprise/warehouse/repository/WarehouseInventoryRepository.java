package com.javaenterprise.warehouse.repository;

import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.entity.WarehouseInventory;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {

    Optional<WarehouseInventory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);

    @Query("SELECT wi.warehouse FROM WarehouseInventory wi " +
            "WHERE wi.product.id = :productId " +
            "AND (wi.totalStock - wi.allocatedStock) >= :requiredQty " +
            "AND wi.warehouse.active = true " +
            "ORDER BY (wi.totalStock - wi.allocatedStock) DESC")
    List<Warehouse> findWarehousesWithAvailableStock(@Param("productId") Long productId, @Param("requiredQty") Integer requiredQty);

    @Nullable List<WarehouseInventory> findByWarehouseId(Long id);
}