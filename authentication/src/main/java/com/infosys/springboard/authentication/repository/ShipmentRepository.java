package com.infosys.springboard.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.Shipment;

@Repository
public interface ShipmentRepository
        extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByTrackingNumber(
            String trackingNumber);

    List<Shipment> findByWarehouseId(
            Long warehouseId);

    List<Shipment> findByStatus(
            String status);

    boolean existsByOrderId(
            Long orderId);

    boolean existsByTrackingNumber(
            String trackingNumber);
}

