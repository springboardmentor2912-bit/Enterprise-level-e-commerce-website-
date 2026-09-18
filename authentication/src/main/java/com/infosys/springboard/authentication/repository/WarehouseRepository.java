package com.infosys.springboard.authentication.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.Warehouse;

@Repository
public interface WarehouseRepository
        extends JpaRepository<Warehouse, Long> {

    List<Warehouse> findByActive(Boolean active);

    List<Warehouse> findByCity(String city);
}