package com.shopstack.repository;

import com.shopstack.entity.InventoryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    List<InventoryHistory> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<InventoryHistory> findByProductVendorIdOrderByCreatedAtDesc(Long vendorId);
}
