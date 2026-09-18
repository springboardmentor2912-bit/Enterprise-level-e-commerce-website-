package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.InventoryHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryHistoryRepository
        extends JpaRepository<InventoryHistory, Long> {

    List<InventoryHistory> findByProductIdOrderByCreatedAtDesc(
            Long productId
    );
}