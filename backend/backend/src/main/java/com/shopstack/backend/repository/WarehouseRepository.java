package com.shopstack.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.shopstack.backend.entity.Warehouse;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    List<Warehouse> findByActiveTrueOrderByNameAsc();
    boolean existsByCode(String code);
}
