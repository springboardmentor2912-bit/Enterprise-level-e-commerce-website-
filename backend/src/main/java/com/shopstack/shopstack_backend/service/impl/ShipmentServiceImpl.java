package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.dto.request.ShipmentRequest;
import com.shopstack.shopstack_backend.dto.response.ShipmentResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Shipment;
import com.shopstack.shopstack_backend.entity.Warehouse;
import com.shopstack.shopstack_backend.notification.EmailNotificationService;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ShipmentRepository;
import com.shopstack.shopstack_backend.service.ShipmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ShipmentServiceImpl
        implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final EmailNotificationService emailNotificationService;

    public ShipmentServiceImpl(
            ShipmentRepository shipmentRepository,
            OrderRepository orderRepository,
            EmailNotificationService emailNotificationService) {

        this.shipmentRepository =
                shipmentRepository;

        this.orderRepository =
                orderRepository;

        this.emailNotificationService =
                emailNotificationService;
    }

    // =========================
    // CREATE SHIPMENT
    // =========================

    @Override
    @Transactional
    public ShipmentResponse createShipment(
            ShipmentRequest request) {

        Order order =
                orderRepository.findById(
                                request.getOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        // =========================
        // CHECK WAREHOUSE ALLOCATION
        // =========================

        Warehouse warehouse =
                order.getWarehouse();

        if (warehouse == null) {

            throw new RuntimeException(
                    "Order is not allocated to a warehouse"
            );
        }

        // =========================
        // CHECK WAREHOUSE STATUS
        // =========================

        if (!warehouse.isActive()) {

            throw new RuntimeException(
                    "Cannot create shipment from an inactive warehouse"
            );
        }

        // =========================
        // CHECK EXISTING SHIPMENT
        // =========================

        if (shipmentRepository
                .findByOrder(order)
                .isPresent()) {

            throw new RuntimeException(
                    "Shipment already exists for this order"
            );
        }

        // =========================
        // CREATE SHIPMENT
        // =========================

        Shipment shipment =
                new Shipment();

        shipment.setOrder(order);

        shipment.setWarehouse(warehouse);

        shipment.setTrackingNumber(
                generateTrackingNumber()
        );

        shipment.setCourierName(
                request.getCourierName()
        );

        shipment.setStatus(
                "PREPARING"
        );

        Shipment savedShipment =
                shipmentRepository.save(
                        shipment
                );

        return convertToResponse(
                savedShipment
        );
    }

    // =========================
    // GET SHIPMENT BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentById(
            Long id) {

        Shipment shipment =
                shipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shipment not found"
                                )
                        );

        return convertToResponse(
                shipment
        );
    }

    // =========================
    // GET SHIPMENT BY ORDER ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentByOrderId(
            Long orderId) {

        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );

        Shipment shipment =
                shipmentRepository
                        .findByOrder(order)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shipment not found for this order"
                                )
                        );

        return convertToResponse(
                shipment
        );
    }

    // =========================
    // GET ALL SHIPMENTS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentResponse>
    getAllShipments() {

        return shipmentRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // =========================
    // UPDATE SHIPMENT STATUS
    // =========================

    @Override
    @Transactional
    public ShipmentResponse updateShipmentStatus(
            Long id,
            String status) {

        Shipment shipment =
                shipmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shipment not found"
                                )
                        );

        if (status == null ||
                status.trim().isEmpty()) {

            throw new RuntimeException(
                    "Shipment status is required"
            );
        }

        String newStatus =
                status.trim().toUpperCase();

        // =========================
        // STATUS TRANSITIONS
        // =========================

        String currentStatus =
                shipment.getStatus();

        boolean validTransition = false;

        if (currentStatus.equals("PREPARING") &&
                newStatus.equals("SHIPPED")) {

            validTransition = true;

            shipment.setShippedAt(
                    LocalDateTime.now()
            );
        }

        else if (currentStatus.equals("SHIPPED") &&
                newStatus.equals("DELIVERED")) {

            validTransition = true;

            shipment.setDeliveredAt(
                    LocalDateTime.now()
            );
        }

        if (!validTransition) {

            throw new RuntimeException(
                    "Invalid shipment status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        shipment.setStatus(newStatus);

        Shipment updatedShipment =
                shipmentRepository.save(
                        shipment
                );

        // =========================
        // UPDATE ORDER STATUS
        // =========================

        Order order =
                shipment.getOrder();

        if (newStatus.equals("DELIVERED")) {

            if (order != null) {

                order.setStatus(
                        OrderStatus.DELIVERED
                );

                orderRepository.save(
                        order
                );
            }
        }

        // =========================
        // ORDER SHIPPED EMAIL
        // =========================

        if (newStatus.equals("SHIPPED")) {

            sendShipmentEmail(
                    updatedShipment,
                    "SHIPPED"
            );
        }

        // =========================
        // ORDER DELIVERED EMAIL
        // =========================

        if (newStatus.equals("DELIVERED")) {

            sendShipmentEmail(
                    updatedShipment,
                    "DELIVERED"
            );
        }

        return convertToResponse(
                updatedShipment
        );
    }

    // =========================
    // SEND SHIPMENT EMAIL
    // =========================

    private void sendShipmentEmail(
            Shipment shipment,
            String status) {

        Order order =
                shipment.getOrder();

        if (order == null ||
                order.getCustomerEmail() == null ||
                order.getCustomerEmail().isBlank()) {

            return;
        }

        String subject;

        if (status.equals("SHIPPED")) {

            subject =
                    "ShopStack - Your Order Has Been Shipped";

        } else {

            subject =
                    "ShopStack - Your Order Has Been Delivered";
        }

        StringBuilder body =
                new StringBuilder();

        body.append("Hello,\n\n");

        if (status.equals("SHIPPED")) {

            body.append(
                    "Your ShopStack order has been shipped successfully.\n\n"
            );

        } else {

            body.append(
                    "Your ShopStack order has been delivered successfully.\n\n"
            );
        }

        body.append("Order Details\n");
        body.append("------------------------------\n");

        body.append("Order ID: ")
                .append(order.getId())
                .append("\n");

        body.append("Tracking Number: ")
                .append(shipment.getTrackingNumber())
                .append("\n");

        body.append("Courier: ")
                .append(
                        shipment.getCourierName() != null
                                ? shipment.getCourierName()
                                : "Not specified"
                )
                .append("\n");

        body.append("Shipment Status: ")
                .append(status)
                .append("\n");

        if (shipment.getShippedAt() != null) {

            body.append("Shipped At: ")
                    .append(shipment.getShippedAt())
                    .append("\n");
        }

        if (shipment.getDeliveredAt() != null) {

            body.append("Delivered At: ")
                    .append(shipment.getDeliveredAt())
                    .append("\n");
        }

        body.append(
                "\nThank you for shopping with ShopStack.\n"
        );

        emailNotificationService.sendEmail(
                order.getCustomerEmail(),
                subject,
                body.toString()
        );
    }

    // =========================
    // GENERATE TRACKING NUMBER
    // =========================

    private String generateTrackingNumber() {

        return "SHP-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    // =========================
    // CONVERT TO RESPONSE
    // =========================

    private ShipmentResponse convertToResponse(
            Shipment shipment) {

        return new ShipmentResponse(
                shipment.getId(),
                shipment.getOrder().getId(),
                shipment.getWarehouse().getId(),
                shipment.getWarehouse().getWarehouseName(),
                shipment.getTrackingNumber(),
                shipment.getCourierName(),
                shipment.getStatus(),
                shipment.getShippedAt(),
                shipment.getDeliveredAt()
        );
    }
}