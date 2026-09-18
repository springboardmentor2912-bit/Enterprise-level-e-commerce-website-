package com.shopstack.service;

import com.shopstack.dto.CreateShipmentRequest;
import com.shopstack.dto.ShipmentDTO;
import com.shopstack.dto.UpdateShipmentStatusRequest;
import com.shopstack.entity.Order;
import com.shopstack.entity.OrderStatus;
import com.shopstack.entity.Shipment;
import com.shopstack.entity.ShipmentStatus;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ShipmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ShipmentServiceImplTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private NotificationService notificationService;

    private ShipmentServiceImpl shipmentService;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        shipmentService = new ShipmentServiceImpl(shipmentRepository, orderRepository, notificationService);

        testOrder = new Order();
        testOrder.setId(100L);
        testOrder.setStatus(OrderStatus.READY_FOR_SHIPPING);
        testOrder.setShippingAddress("123 Tech Lane");
    }

    @Test
    @DisplayName("Create Shipment successfully for READY_FOR_SHIPPING Order")
    void testCreateShipmentSuccess() {
        when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
        when(shipmentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> {
            Shipment s = i.getArgument(0);
            s.setId(1L);
            return s;
        });

        CreateShipmentRequest req = new CreateShipmentRequest();
        req.setCarrier("Express Logistics");
        req.setTrackingId("TRK-100-TEST");
        req.setCurrentLocation("Bangalore Hub");

        ShipmentDTO dto = shipmentService.createShipment(100L, req);

        assertNotNull(dto);
        assertEquals(100L, dto.getOrderId());
        assertEquals("TRK-100-TEST", dto.getTrackingId());
        assertEquals("Express Logistics", dto.getCarrier());
        assertEquals(ShipmentStatus.SHIPMENT_CREATED, dto.getStatus());
        verify(shipmentRepository, times(1)).save(any(Shipment.class));
    }

    @Test
    @DisplayName("Update Shipment Status: SHIPMENT_CREATED -> SHIPPED updates Order status to SHIPPED")
    void testUpdateShipmentStatusShipped() {
        Shipment shipment = new Shipment(testOrder, "TRK-100-TEST", "Express", "Hub", "Ready");
        shipment.setId(1L);
        shipment.setStatus(ShipmentStatus.SHIPMENT_CREATED);

        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        UpdateShipmentStatusRequest req = new UpdateShipmentStatusRequest();
        req.setStatus(ShipmentStatus.SHIPPED);
        req.setCurrentLocation("In Transit Dispatch");

        ShipmentDTO dto = shipmentService.updateShipmentStatus(1L, req);

        assertEquals(ShipmentStatus.SHIPPED, dto.getStatus());
        assertEquals(OrderStatus.SHIPPED, testOrder.getStatus());
        assertNotNull(shipment.getShippedAt());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    @DisplayName("Update Shipment Status: SHIPPED -> DELIVERED updates Order status to DELIVERED")
    void testUpdateShipmentStatusDelivered() {
        Shipment shipment = new Shipment(testOrder, "TRK-100-TEST", "Express", "Hub", "Shipped");
        shipment.setId(1L);
        shipment.setStatus(ShipmentStatus.SHIPPED);
        testOrder.setStatus(OrderStatus.SHIPPED);

        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));
        when(shipmentRepository.save(any(Shipment.class))).thenAnswer(i -> i.getArgument(0));

        UpdateShipmentStatusRequest req = new UpdateShipmentStatusRequest();
        req.setStatus(ShipmentStatus.DELIVERED);
        req.setCurrentLocation("Customer Doorstep");

        ShipmentDTO dto = shipmentService.updateShipmentStatus(1L, req);

        assertEquals(ShipmentStatus.DELIVERED, dto.getStatus());
        assertEquals(OrderStatus.DELIVERED, testOrder.getStatus());
        assertNotNull(shipment.getDeliveredAt());
        verify(orderRepository, times(1)).save(testOrder);
    }

    @Test
    @DisplayName("Invalid status transition throws IllegalStateException")
    void testInvalidStatusTransition() {
        Shipment shipment = new Shipment(testOrder, "TRK-100-TEST", "Express", "Hub", "Created");
        shipment.setId(1L);
        shipment.setStatus(ShipmentStatus.SHIPMENT_CREATED);

        when(shipmentRepository.findById(1L)).thenReturn(Optional.of(shipment));

        UpdateShipmentStatusRequest req = new UpdateShipmentStatusRequest();
        req.setStatus(ShipmentStatus.DELIVERED); // Cannot skip directly from SHIPMENT_CREATED to DELIVERED

        assertThrows(IllegalStateException.class, () -> shipmentService.updateShipmentStatus(1L, req));
    }
}
