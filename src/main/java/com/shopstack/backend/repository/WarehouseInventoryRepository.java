package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.Warehouse;
import com.shopstack.backend.entity.WarehouseInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WarehouseInventoryRepository extends JpaRepository<WarehouseInventory, Long> {
    Optional<WarehouseInventory> findByWarehouseAndProduct(Warehouse warehouse, Product product);
    List<WarehouseInventory> findByWarehouse(Warehouse warehouse);
    List<WarehouseInventory> findByProduct(Product product);
}
