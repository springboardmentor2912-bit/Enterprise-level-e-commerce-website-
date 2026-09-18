package com.shopstack.repository;

import com.shopstack.entity.Shipment;
import com.shopstack.entity.ShipmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrderId(Long orderId);
    Optional<Shipment> findByTrackingId(String trackingId);
    List<Shipment> findByStatus(ShipmentStatus status);
    List<Shipment> findAllByOrderByCreatedAtDesc();
}
