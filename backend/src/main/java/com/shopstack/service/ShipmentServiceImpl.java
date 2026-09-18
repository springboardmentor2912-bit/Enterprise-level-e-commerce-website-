package com.shopstack.service;

import com.shopstack.dto.CreateShipmentRequest;
import com.shopstack.dto.ShipmentDTO;
import com.shopstack.dto.UpdateShipmentStatusRequest;
import com.shopstack.entity.Order;
import com.shopstack.entity.OrderStatus;
import com.shopstack.entity.Shipment;
import com.shopstack.entity.ShipmentStatus;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ShipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private static final Logger logger = LoggerFactory.getLogger(ShipmentServiceImpl.class);

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository, OrderRepository orderRepository, NotificationService notificationService) {
        this.shipmentRepository = shipmentRepository;
        this.orderRepository = orderRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public ShipmentDTO createShipment(Long orderId, CreateShipmentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (shipmentRepository.findByOrderId(orderId).isPresent()) {
            throw new IllegalStateException("Shipment record already exists for Order #" + orderId);
        }

        // Verify order is READY_FOR_SHIPPING or PROCESSING/SHIPPED
        if (!OrderStatus.READY_FOR_SHIPPING.equals(order.getStatus()) &&
            !OrderStatus.PROCESSING.equals(order.getStatus()) &&
            !OrderStatus.SHIPPED.equals(order.getStatus())) {
            throw new IllegalStateException("Order #" + orderId + " is not ready for shipment. Current status: " + order.getStatus());
        }

        String trackingId = request != null && request.getTrackingId() != null && !request.getTrackingId().isBlank()
                ? request.getTrackingId().trim()
                : generateTrackingId();

        String carrier = request != null && request.getCarrier() != null && !request.getCarrier().isBlank()
                ? request.getCarrier().trim()
                : "ShopStack Express";

        String location = request != null ? request.getCurrentLocation() : "Fulfillment Center";
        String notes = request != null ? request.getTrackingNotes() : "Shipment manifest created.";

        Shipment shipment = new Shipment(order, trackingId, carrier, location, notes);
        shipment.setStatus(ShipmentStatus.SHIPMENT_CREATED);

        Shipment saved = shipmentRepository.save(shipment);
        logger.info("Created shipment #{} (Tracking ID: {}) for Order #{}", saved.getId(), saved.getTrackingId(), orderId);

        return new ShipmentDTO(saved);
    }

    @Override
    @Transactional
    public ShipmentDTO updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with ID: " + shipmentId));

        if (request == null || request.getStatus() == null) {
            throw new IllegalArgumentException("Target shipment status is required.");
        }

        ShipmentStatus newStatus = request.getStatus();
        ShipmentStatus currentStatus = shipment.getStatus();

        if (currentStatus.equals(newStatus)) {
            // Just update location and notes if status is same
            if (request.getCurrentLocation() != null) shipment.setCurrentLocation(request.getCurrentLocation());
            if (request.getTrackingNotes() != null) shipment.setTrackingNotes(request.getTrackingNotes());
            return new ShipmentDTO(shipmentRepository.save(shipment));
        }

        validateStatusTransition(currentStatus, newStatus);

        shipment.setStatus(newStatus);
        if (request.getCurrentLocation() != null && !request.getCurrentLocation().isBlank()) {
            shipment.setCurrentLocation(request.getCurrentLocation());
        }
        if (request.getTrackingNotes() != null && !request.getTrackingNotes().isBlank()) {
            shipment.setTrackingNotes(request.getTrackingNotes());
        }

        Order order = shipment.getOrder();

        if (ShipmentStatus.SHIPPED.equals(newStatus)) {
            shipment.setShippedAt(LocalDateTime.now());
            order.setStatus(OrderStatus.SHIPPED);
            orderRepository.save(order);
            logger.info("Shipment #{}: Status updated to SHIPPED. Order #{} marked SHIPPED.", shipmentId, order.getId());
        } else if (ShipmentStatus.DELIVERED.equals(newStatus)) {
            shipment.setDeliveredAt(LocalDateTime.now());
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
            logger.info("Shipment #{}: Status updated to DELIVERED. Order #{} marked DELIVERED.", shipmentId, order.getId());
        }

        Shipment updated = shipmentRepository.save(shipment);

        if (ShipmentStatus.SHIPPED.equals(newStatus)) {
            notificationService.sendOrderShippedEmail(order, updated);
        } else if (ShipmentStatus.DELIVERED.equals(newStatus)) {
            notificationService.sendOrderDeliveredEmail(order, updated);
        }

        return new ShipmentDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment record found for Order #" + orderId));
        return new ShipmentDTO(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipmentDTO getShipmentByTrackingId(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with tracking ID: " + trackingId));
        return new ShipmentDTO(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipmentDTO> getAllShipments() {
        return shipmentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(ShipmentDTO::new)
                .collect(Collectors.toList());
    }

    private String generateTrackingId() {
        long timestamp = System.currentTimeMillis() % 1000000;
        int random = 1000 + new Random().nextInt(9000);
        return "TRK-" + timestamp + "-" + random;
    }

    private void validateStatusTransition(ShipmentStatus current, ShipmentStatus target) {
        // Enforce valid flow: SHIPMENT_CREATED -> SHIPPED -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED
        if (current.equals(ShipmentStatus.SHIPMENT_CREATED) && !target.equals(ShipmentStatus.SHIPPED)) {
            throw new IllegalStateException("Initial shipment status must transition to SHIPPED first. Cannot skip to " + target);
        }
        if (current.equals(ShipmentStatus.DELIVERED)) {
            throw new IllegalStateException("Shipment is already DELIVERED and cannot be changed.");
        }
    }
}
