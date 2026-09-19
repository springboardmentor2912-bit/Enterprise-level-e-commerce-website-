package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipmentRepository
        extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}