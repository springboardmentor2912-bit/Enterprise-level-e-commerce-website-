package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.entity.*;
import com.shopstack.shopstack_backend.repository.*;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShippingService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;

    public ShippingService(
            ShipmentRepository shipmentRepository,
            OrderRepository orderRepository) {

        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
    }

    public Shipment createShipment(
            Long orderId,
            String courierName) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"));

        Shipment shipment =
                new Shipment();

        shipment.setOrder(order);
        shipment.setCourierName(courierName);

        shipment.setTrackingNumber(
                "SHP" + System.currentTimeMillis()
        );

        shipment.setStatus(
                ShipmentStatus.CREATED
        );

        return shipmentRepository.save(shipment);
    }

    public Shipment updateTracking(
            Long shipmentId,
            ShipmentStatus status) {

        Shipment shipment =
                shipmentRepository.findById(shipmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shipment not found"));

        shipment.setStatus(status);

        if (status == ShipmentStatus.SHIPPED) {
            shipment.setShippedAt(
                    LocalDateTime.now()
            );
        }

        if (status == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(
                    LocalDateTime.now()
            );
        }

        return shipmentRepository.save(shipment);
    }

    public Shipment getShipment(Long orderId) {

        return shipmentRepository
                .findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found"));
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }
}