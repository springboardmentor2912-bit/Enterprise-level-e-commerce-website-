package com.infosys.auth.service;

import com.infosys.auth.model.*;
import com.infosys.auth.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReturnServiceTest {

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ReturnService returnService;

    private Order deliveredOrder;
    private ReturnRequest returnReq;

    @BeforeEach
    void setUp() {
        deliveredOrder = new Order(5L, "Rahul Sharma", new BigDecimal("150000.00"), "123 Indiranagar, Bangalore");
        deliveredOrder.setId(101L);
        deliveredOrder.setStatus(Order.OrderStatus.DELIVERED);
        deliveredOrder.setWarehouseId(1L);
        deliveredOrder.setWarehouseName("Bangalore Central Hub");

        OrderItem item = new OrderItem(10L, "Zenith Pro Laptop", null, new BigDecimal("75000.00"), 2, 1L);
        deliveredOrder.setItems(new ArrayList<>(List.of(item)));

        returnReq = new ReturnRequest(101L, 5L, "Rahul Sharma", 1L, "Defective display flickering", new BigDecimal("150000.00"));
        returnReq.setId(501L);
    }

    @Test
    @DisplayName("Create Return: Customer can request return for DELIVERED order")
    void testCreateReturnRequest_Success() {
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));
        when(returnRequestRepository.findByOrderId(101L)).thenReturn(Optional.empty());
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequest created = returnService.createReturnRequest(101L, 5L, "Defective display flickering");

        assertNotNull(created);
        assertEquals(ReturnRequest.ReturnStatus.REQUESTED, created.getStatus());
        assertEquals(Order.OrderStatus.RETURN_REQUESTED, deliveredOrder.getStatus());
        verify(orderRepository).save(deliveredOrder);
    }

    @Test
    @DisplayName("Create Return Negative: Rejects return if order is not DELIVERED")
    void testCreateReturnRequest_NonDelivered_Fails() {
        deliveredOrder.setStatus(Order.OrderStatus.SHIPPED);
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));

        RuntimeException ex = assertThrows(RuntimeException.class, () ->
                returnService.createReturnRequest(101L, 5L, "Wrong item")
        );

        assertTrue(ex.getMessage().contains("DELIVERED"));
    }

    @Test
    @DisplayName("QC Inspection Passed: Restocks inventory, records movement and issues refund")
    void testPerformQcInspection_Passed() {
        when(returnRequestRepository.findById(501L)).thenReturn(Optional.of(returnReq));
        when(orderRepository.findById(101L)).thenReturn(Optional.of(deliveredOrder));

        WarehouseInventory inv = new WarehouseInventory(1L, 10L, "Zenith Pro Laptop", "ZEN-LAP-01", 10, 0, "Aisle-1-Bin-10");
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 10L)).thenReturn(Optional.of(inv));
        when(warehouseInventoryRepository.getTotalAvailableStockForProduct(10L)).thenReturn(12);
        Product laptop = new Product(10L, "Zenith Pro Laptop", "Description", new BigDecimal("75000.00"), "Electronics", 10, null, "SKU", 4.8, 1L, "Vendor", BigDecimal.ZERO, true);
        when(productRepository.findById(10L)).thenReturn(Optional.of(laptop));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReturnRequest processed = returnService.performQcInspection(501L, true, "Display hardware verified, boxed with original packaging", 33L, "QC Inspector Ajay");

        assertEquals(ReturnRequest.ReturnStatus.REFUNDED, processed.getStatus());
        assertEquals(Order.OrderStatus.REFUNDED, deliveredOrder.getStatus());
        assertEquals("PASSED", deliveredOrder.getQcStatus());
        assertEquals(new BigDecimal("150000.00"), deliveredOrder.getRefundAmount());

        // Restocked check: 10 + 2 = 12
        assertEquals(12, inv.getAvailableQuantity());
        verify(stockMovementRepository, times(1)).save(argThat(sm -> sm.getMovementType() == StockMovement.MovementType.RETURN_RESTOCK));
    }
}
