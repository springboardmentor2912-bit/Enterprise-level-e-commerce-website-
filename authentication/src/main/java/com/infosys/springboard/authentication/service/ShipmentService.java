package com.infosys.springboard.authentication.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.dto.ShipmentRequest;
import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.entity.Shipment;
import com.infosys.springboard.authentication.entity.WarehouseAllocation;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.ShipmentRepository;
import com.infosys.springboard.authentication.repository.WarehouseAllocationRepository;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final WarehouseAllocationRepository allocationRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            OrderRepository orderRepository,
            WarehouseAllocationRepository allocationRepository) {

        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.allocationRepository = allocationRepository;
    }

    // =========================================================
    // CREATE SHIPMENT
    // =========================================================

    public Shipment createShipment(ShipmentRequest request) {

        if (request == null) {
            throw new RuntimeException("Shipment request cannot be null");
        }

        if (request.getOrderId() == null) {
            throw new RuntimeException("Order ID is required");
        }

        if (request.getWarehouseId() == null) {
            throw new RuntimeException("Warehouse ID is required");
        }

        if (request.getTrackingNumber() == null
                || request.getTrackingNumber().trim().isEmpty()) {

            throw new RuntimeException("Tracking number is required");
        }

        if (request.getCarrier() == null
                || request.getCarrier().trim().isEmpty()) {

            throw new RuntimeException("Carrier is required");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: "
                                        + request.getOrderId()));

        WarehouseAllocation allocation =
                allocationRepository.findByOrderId(request.getOrderId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Warehouse allocation not found "
                                                + "for order: "
                                                + request.getOrderId()));

        // Check that selected warehouse matches allocated warehouse
        if (!Objects.equals(
                allocation.getWarehouseId(),
                request.getWarehouseId())) {

            throw new RuntimeException(
                    "Selected warehouse does not match "
                            + "the allocated warehouse");
        }

        // Prevent duplicate shipment
        if (shipmentRepository.existsByOrderId(request.getOrderId())) {

            throw new RuntimeException(
                    "Shipment already exists for this order");
        }

        // Shipment can only be created after allocation is ready
        if (!"READY_FOR_SHIPMENT".equalsIgnoreCase(
                allocation.getStatus())) {

            throw new RuntimeException(
                    "Shipment can only be created when allocation "
                            + "status is READY_FOR_SHIPMENT");
        }

        // Check tracking number
        if (shipmentRepository.existsByTrackingNumber(
                request.getTrackingNumber().trim())) {

            throw new RuntimeException(
                    "Tracking number already exists");
        }

        Shipment shipment = new Shipment();

        shipment.setOrderId(order.getId());
        shipment.setWarehouseId(request.getWarehouseId());

        shipment.setTrackingNumber(
                request.getTrackingNumber().trim());

        shipment.setCarrier(
                request.getCarrier().trim());

        // New shipment always starts from CREATED
        shipment.setStatus("CREATED");

        shipment.setRemarks(request.getRemarks());

        shipment.setCreatedAt(LocalDateTime.now());
        shipment.setUpdatedAt(LocalDateTime.now());

        return shipmentRepository.save(shipment);
    }

    // =========================================================
    // GET ALL SHIPMENTS
    // =========================================================

    public List<Shipment> getAllShipments() {

        return shipmentRepository.findAll();
    }

    // =========================================================
    // GET SHIPMENT BY ID
    // =========================================================

    public Shipment getShipmentById(Long id) {

        return shipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found with ID: " + id));
    }

    // =========================================================
    // GET SHIPMENT BY ORDER ID
    // =========================================================

    public Shipment getShipmentByOrderId(Long orderId) {

        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found for order ID: "
                                        + orderId));
    }

    // =========================================================
    // GET SHIPMENT BY TRACKING NUMBER
    // =========================================================

    public Shipment getByTrackingNumber(String trackingNumber) {

        return shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shipment not found with tracking "
                                        + "number: "
                                        + trackingNumber));
    }

    // =========================================================
    // GET SHIPMENTS BY WAREHOUSE
    // =========================================================

    public List<Shipment> getByWarehouse(Long warehouseId) {

        return shipmentRepository.findByWarehouseId(warehouseId);
    }

    // =========================================================
    // GET SHIPMENTS BY STATUS
    // =========================================================

    public List<Shipment> getByStatus(String status) {

        validateStatus(status);

        return shipmentRepository.findByStatus(
                status.trim().toUpperCase());
    }

    // =========================================================
    // UPDATE SHIPMENT STATUS
    // =========================================================

    public Shipment updateStatus(
            Long id,
            String status,
            String remarks) {

        Shipment shipment = getShipmentById(id);

        String currentStatus = shipment.getStatus();

        String newStatus = status == null
                ? ""
                : status.trim().toUpperCase();

        // Validate requested status
        validateStatus(newStatus);

        // Validate step-by-step transition
        validateTransition(
                currentStatus,
                newStatus);

        LocalDateTime now = LocalDateTime.now();

        shipment.setStatus(newStatus);

        // Update remarks
        if (remarks != null
                && !remarks.trim().isEmpty()) {

            shipment.setRemarks(
                    remarks.trim());
        }

        // =====================================================
        // CREATED -> IN_TRANSIT
        // =====================================================

        if ("IN_TRANSIT".equals(newStatus)) {

            if (shipment.getShippedAt() == null) {
                shipment.setShippedAt(now);
            }

            // Update order status
            Order order = orderRepository
                    .findById(shipment.getOrderId())
                    .orElse(null);

            if (order != null) {

                order.setStatus("SHIPPED");

                orderRepository.save(order);
            }

            // Update warehouse allocation
            WarehouseAllocation allocation =
                    allocationRepository
                            .findByOrderId(
                                    shipment.getOrderId())
                            .orElse(null);

            if (allocation != null) {

                allocation.setStatus("SHIPPED");

                allocation.setUpdatedAt(now);

                allocation.setRemarks(
                        "Shipment is now in transit");

                allocationRepository.save(allocation);
            }
        }

        // =====================================================
        // IN_TRANSIT -> OUT_FOR_DELIVERY
        // =====================================================

        if ("OUT_FOR_DELIVERY".equals(newStatus)) {

            if (shipment.getShippedAt() == null) {
                shipment.setShippedAt(now);
            }
        }

        // =====================================================
        // OUT_FOR_DELIVERY -> DELIVERED
        // =====================================================

        if ("DELIVERED".equals(newStatus)) {

            if (shipment.getDeliveredAt() == null) {
                shipment.setDeliveredAt(now);
            }

            if (shipment.getShippedAt() == null) {
                shipment.setShippedAt(now);
            }

            // Update order
            Order order = orderRepository
                    .findById(shipment.getOrderId())
                    .orElse(null);

            if (order != null) {

                order.setStatus("DELIVERED");

                orderRepository.save(order);
            }

            // Update allocation
            WarehouseAllocation allocation =
                    allocationRepository
                            .findByOrderId(
                                    shipment.getOrderId())
                            .orElse(null);

            if (allocation != null) {

                allocation.setStatus("SHIPPED");

                allocation.setUpdatedAt(now);

                allocation.setRemarks(
                        "Shipment delivered");

                allocationRepository.save(allocation);
            }
        }

        // =====================================================
        // CANCELLED
        // =====================================================

        if ("CANCELLED".equals(newStatus)) {

            WarehouseAllocation allocation =
                    allocationRepository
                            .findByOrderId(
                                    shipment.getOrderId())
                            .orElse(null);

            if (allocation != null) {

                allocation.setStatus("CANCELLED");

                allocation.setUpdatedAt(now);

                allocation.setRemarks(
                        "Shipment cancelled");

                allocationRepository.save(allocation);
            }
        }

        shipment.setUpdatedAt(now);

        return shipmentRepository.save(shipment);
    }

    // =========================================================
    // VALIDATE SHIPMENT STATUS
    // =========================================================

    private void validateStatus(String status) {

        if (status == null
                || status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Shipment status is required");
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("CREATED")
                && !normalizedStatus.equals("IN_TRANSIT")
                && !normalizedStatus.equals("OUT_FOR_DELIVERY")
                && !normalizedStatus.equals("DELIVERED")
                && !normalizedStatus.equals("CANCELLED")) {

            throw new RuntimeException(
                    "Invalid shipment status: "
                            + status);
        }
    }

    // =========================================================
    // VALIDATE STATUS TRANSITION
    // =========================================================

    private void validateTransition(
            String currentStatus,
            String newStatus) {

        if (currentStatus == null
                || currentStatus.trim().isEmpty()) {

            throw new RuntimeException(
                    "Current shipment status is missing");
        }

        String current =
                currentStatus.trim().toUpperCase();

        switch (current) {

            case "CREATED":

                if (!newStatus.equals("IN_TRANSIT")
                        && !newStatus.equals("CANCELLED")) {

                    throw new RuntimeException(
                            "Shipment can move from CREATED "
                                    + "only to IN_TRANSIT "
                                    + "or CANCELLED");
                }

                break;

            case "IN_TRANSIT":

                if (!newStatus.equals("OUT_FOR_DELIVERY")
                        && !newStatus.equals("CANCELLED")) {

                    throw new RuntimeException(
                            "Shipment can move from IN_TRANSIT "
                                    + "only to OUT_FOR_DELIVERY "
                                    + "or CANCELLED");
                }

                break;

            case "OUT_FOR_DELIVERY":

                if (!newStatus.equals("DELIVERED")) {

                    throw new RuntimeException(
                            "Shipment can move from "
                                    + "OUT_FOR_DELIVERY "
                                    + "only to DELIVERED");
                }

                break;

            case "DELIVERED":

                throw new RuntimeException(
                        "Delivered shipment cannot be updated");

            case "CANCELLED":

                throw new RuntimeException(
                        "Cancelled shipment cannot be updated");

            default:

                throw new RuntimeException(
                        "Unknown current shipment status: "
                                + currentStatus);
        }
    }
}