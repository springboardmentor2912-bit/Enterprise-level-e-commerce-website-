package com.shopstack.repository;

import com.shopstack.entity.WarehouseTask;
import com.shopstack.enums.WarehouseTaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WarehouseTaskRepository extends JpaRepository<WarehouseTask, Long> {
    Optional<WarehouseTask> findByOrderId(Long orderId);
    Page<WarehouseTask> findByStatusNotOrderByCreatedAtAsc(WarehouseTaskStatus excludedStatus, Pageable pageable);
    Page<WarehouseTask> findAllByOrderByCreatedAtAsc(Pageable pageable);
}
