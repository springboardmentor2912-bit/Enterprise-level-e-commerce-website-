package com.infosys.auth.repository;

import com.infosys.auth.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCode(String code);
    Optional<Warehouse> findByName(String name);
    List<Warehouse> findByActiveTrue();
    List<Warehouse> findByLocationCityIgnoreCaseAndActiveTrue(String locationCity);
}
