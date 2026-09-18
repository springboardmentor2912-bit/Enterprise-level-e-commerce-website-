package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Shipment;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ShipmentRepository
        extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrder(Order order);

    Optional<Shipment> findByTrackingNumber(
            String trackingNumber
    );

    List<Shipment> findByWarehouse(
            Warehouse warehouse
    );
}