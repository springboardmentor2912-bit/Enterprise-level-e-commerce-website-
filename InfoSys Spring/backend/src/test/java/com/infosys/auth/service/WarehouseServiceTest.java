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
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WarehouseServiceTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WarehouseService warehouseService;

    private Warehouse warehouseBlr;
    private Warehouse warehouseMum;
    private Product laptopProduct;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        warehouseBlr = new Warehouse("Bangalore Central Hub", "WH-BLR-01", "Bangalore", "Electronic City", 50000, "+91 9876543210", "blr@test.com");
        warehouseBlr.setId(1L);

        warehouseMum = new Warehouse("Mumbai Western Terminal", "WH-MUM-01", "Mumbai", "Bhiwandi", 65000, "+91 9876543211", "mum@test.com");
        warehouseMum.setId(2L);

        laptopProduct = new Product(10L, "Zenith Pro Laptop", "Core i9 High Performance Laptop", new BigDecimal("75000.00"), "Electronics", 20, null, "ZEN-LAP-01", 4.9, 1L, "Aura Atelier", BigDecimal.ZERO, true);

        sampleOrder = new Order(5L, "Rahul Sharma", new BigDecimal("150000.00"), "123 Indiranagar, Bangalore");
        sampleOrder.setId(101L);
        OrderItem item = new OrderItem(10L, "Zenith Pro Laptop", null, new BigDecimal("75000.00"), 2, 1L);
        sampleOrder.setItems(new ArrayList<>(List.of(item)));
    }

    @Test
    @DisplayName("Allocate Order: Automatically selects warehouse with sufficient stock and reserves quantity")
    void testAutoAllocateWarehouse_SufficientStock() {
        when(warehouseRepository.findByActiveTrue()).thenReturn(List.of(warehouseBlr, warehouseMum));
        
        WarehouseInventory blrInv = new WarehouseInventory(1L, 10L, "Zenith Pro Laptop", "ZEN-LAP-01", 15, 0, "Aisle-1-Bin-10");
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 10L)).thenReturn(Optional.of(blrInv));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order allocated = warehouseService.allocateOrderToWarehouse(sampleOrder);

        assertNotNull(allocated);
        assertEquals(Order.OrderStatus.ALLOCATED, allocated.getStatus());
        assertEquals(1L, allocated.getWarehouseId());
        assertEquals("Bangalore Central Hub", allocated.getWarehouseName());
        assertEquals(2, blrInv.getReservedQuantity());
        verify(stockMovementRepository, times(1)).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Pick Order: Transitions order to PICKED with staff metadata")
    void testPickOrder() {
        sampleOrder.setStatus(Order.OrderStatus.ALLOCATED);
        sampleOrder.setWarehouseId(1L);
        sampleOrder.setWarehouseName("Bangalore Central Hub");

        when(orderRepository.findById(101L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order picked = warehouseService.pickOrder(101L, 22L, "Suresh Warehouse Staff");

        assertEquals(Order.OrderStatus.PICKED, picked.getStatus());
        assertEquals(22L, picked.getPickedByStaffId());
        assertEquals("Suresh Warehouse Staff", picked.getPickedByStaffName());
        assertNotNull(picked.getPickedAt());
        verify(stockMovementRepository, atLeastOnce()).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Pack Order: Transitions order to PACKED with package details")
    void testPackOrder() {
        sampleOrder.setStatus(Order.OrderStatus.PICKED);
        sampleOrder.setWarehouseId(1L);
        sampleOrder.setWarehouseName("Bangalore Central Hub");

        when(orderRepository.findById(101L)).thenReturn(Optional.of(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order packed = warehouseService.packOrder(101L, 22L, "Suresh Warehouse Staff", "Heavy Bubble Wrapped Box");

        assertEquals(Order.OrderStatus.PACKED, packed.getStatus());
        assertEquals(22L, packed.getPackedByStaffId());
        assertNotNull(packed.getPackedAt());
        verify(stockMovementRepository, atLeastOnce()).save(any(StockMovement.class));
    }

    @Test
    @DisplayName("Prepare Shipment: Deducts inventory, clears reservation and sets carrier tracking")
    void testPrepareShipment() {
        sampleOrder.setStatus(Order.OrderStatus.PACKED);
        sampleOrder.setWarehouseId(1L);
        sampleOrder.setWarehouseName("Bangalore Central Hub");

        WarehouseInventory blrInv = new WarehouseInventory(1L, 10L, "Zenith Pro Laptop", "ZEN-LAP-01", 10, 2, "Aisle-1-Bin-10");
        when(orderRepository.findById(101L)).thenReturn(Optional.of(sampleOrder));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 10L)).thenReturn(Optional.of(blrInv));
        when(warehouseInventoryRepository.getTotalAvailableStockForProduct(10L)).thenReturn(8);
        when(productRepository.findById(10L)).thenReturn(Optional.of(laptopProduct));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Order shipped = warehouseService.prepareShipment(101L, "BlueDart Express", "TRK-BLR-998877", 22L, "Suresh Staff");

        assertEquals(Order.OrderStatus.SHIPPED, shipped.getStatus());
        assertEquals("BlueDart Express", shipped.getCarrierName());
        assertEquals("TRK-BLR-998877", shipped.getTrackingNumber());
        assertNotNull(shipped.getShippedAt());

        // Physical inventory check: 10 - 2 = 8, reserved: 2 - 2 = 0
        assertEquals(8, blrInv.getAvailableQuantity());
        assertEquals(0, blrInv.getReservedQuantity());
        assertEquals(8, laptopProduct.getStockQuantity());
    }

    @Test
    @DisplayName("Cancel Order: Releases warehouse reserved stock and logs CANCELLED_RESTOCK")
    void testDeallocateCancelledOrder() {
        sampleOrder.setWarehouseId(1L);
        sampleOrder.setWarehouseName("Bangalore Central Hub");

        WarehouseInventory blrInv = new WarehouseInventory(1L, 10L, "Zenith Pro Laptop", "ZEN-LAP-01", 10, 2, "Aisle-1-Bin-10");
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 10L)).thenReturn(Optional.of(blrInv));

        warehouseService.deallocateCancelledOrder(sampleOrder);

        assertEquals(0, blrInv.getReservedQuantity());
        verify(stockMovementRepository, times(1)).save(argThat(sm -> sm.getMovementType() == StockMovement.MovementType.CANCELLED_RESTOCK));
    }
}
