package com.shopstack.service;

import com.shopstack.dto.fulfillment.ShipmentRequest;
import com.shopstack.dto.fulfillment.ShipmentResponse;
import com.shopstack.entity.Order;
import com.shopstack.entity.Shipment;
import com.shopstack.enums.OrderStatus;
import com.shopstack.enums.ShipmentStatus;
import com.shopstack.enums.WarehouseTaskStatus;
import com.shopstack.exception.BadRequestException;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ShipmentRepository;
import com.shopstack.repository.WarehouseTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final WarehouseTaskRepository warehouseTaskRepository;

    /** Warehouse/Admin creates the shipment once a task is packed — this also flips the order to SHIPPED. */
    @Transactional
    public Shipment createShipment(Long orderId, ShipmentRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (shipmentRepository.findByOrderId(orderId).isPresent()) {
            throw new BadRequestException("A shipment already exists for this order");
        }

        warehouseTaskRepository.findByOrderId(orderId).ifPresent(task -> {
            if (task.getStatus() != WarehouseTaskStatus.PACKED && task.getStatus() != WarehouseTaskStatus.READY_FOR_SHIPMENT) {
                throw new BadRequestException("This order must be picked and packed before it can be shipped");
            }
            task.setStatus(WarehouseTaskStatus.READY_FOR_SHIPMENT);
            warehouseTaskRepository.save(task);
        });

        Shipment shipment = Shipment.builder()
                .order(order)
                .carrier(request.getCarrier())
                .trackingNumber(request.getTrackingNumber())
                .status(ShipmentStatus.SHIPPED)
                .shippedAt(LocalDateTime.now())
                .estimatedDelivery(LocalDateTime.now().plusDays(5))
                .build();
        shipment = shipmentRepository.save(shipment);

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        return shipment;
    }

    @Transactional
    public Shipment updateStatus(Long orderId, ShipmentStatus newStatus) {
        Shipment shipment = getByOrderId(orderId);
        shipment.setStatus(newStatus);
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
            Order order = shipment.getOrder();
            order.setStatus(OrderStatus.DELIVERED);
            orderRepository.save(order);
        }
        return shipmentRepository.save(shipment);
    }

    public Shipment getByOrderId(Long orderId) {
        return shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found for this order yet"));
    }

    public ShipmentResponse toResponse(Shipment s) {
        return ShipmentResponse.builder()
                .id(s.getId())
                .orderId(s.getOrder().getId())
                .orderNumber(s.getOrder().getOrderNumber())
                .carrier(s.getCarrier())
                .trackingNumber(s.getTrackingNumber())
                .status(s.getStatus().name())
                .shippedAt(s.getShippedAt())
                .deliveredAt(s.getDeliveredAt())
                .estimatedDelivery(s.getEstimatedDelivery())
                .build();
    }
}
