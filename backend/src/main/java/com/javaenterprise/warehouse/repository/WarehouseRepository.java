package com.javaenterprise.warehouse.repository;

import com.javaenterprise.warehouse.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {

    // 1. Find active warehouses in a specific state (used for location-based allocation)
    List<Warehouse> findByStateIgnoreCaseAndActiveTrue(String state);

    // 2. Fallback: Find any active warehouse if no state match is found
    Optional<Warehouse> findFirstByActiveTrue();
}