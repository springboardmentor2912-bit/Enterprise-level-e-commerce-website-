package com.shopstack.repository;

import com.shopstack.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT i FROM Inventory i WHERE i.product.vendor.id = :vendorId")
    List<Inventory> findByVendorId(Long vendorId);
}
