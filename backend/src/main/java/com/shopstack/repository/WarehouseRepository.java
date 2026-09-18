package com.shopstack.repository;

import com.shopstack.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCode(String code);
    List<Warehouse> findByActiveTrue();
    boolean existsByCode(String code);
}
