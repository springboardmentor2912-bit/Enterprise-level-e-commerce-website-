package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.*;
import com.shopstack.repository.*;
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
class WarehouseServiceImplTest {

    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;
    @Mock
    private WarehouseOrderAllocationRepository warehouseOrderAllocationRepository;
    @Mock
    private StockMovementLogRepository stockMovementLogRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private ReturnRequestRepository returnRequestRepository;
    @Mock
    private ReturnService returnService;
    @Mock
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    @Mock
    private InventoryHistoryRepository inventoryHistoryRepository;

    @InjectMocks
    private WarehouseServiceImpl warehouseService;

    private Warehouse mainWarehouse;
    private Product product;
    private Order order;
    private OrderItem orderItem;

    @BeforeEach
    void setUp() {
        mainWarehouse = new Warehouse("Main Warehouse", "WH-MAIN-01", "Seattle", "manager@shopstack.com", WarehouseStatus.ACTIVE);
        mainWarehouse.setId(1L);

        product = new Product();
        product.setId(101L);
        product.setName("Test Product");
        product.setPrice(new BigDecimal("99.99"));

        order = new Order();
        order.setId(501L);
        order.setStatus(OrderStatus.CONFIRMED);

        orderItem = new OrderItem();
        orderItem.setId(1001L);
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setQuantity(2);

        order.setItems(List.of(orderItem));
    }

    @Test
    @DisplayName("Create warehouse - Success")
    void testCreateWarehouseSuccess() {
        CreateWarehouseRequest req = new CreateWarehouseRequest();
        req.setName("Central Hub");
        req.setCode("WH-CENTRAL");
        req.setLocation("New York");

        when(warehouseRepository.findByCode("WH-CENTRAL")).thenReturn(Optional.empty());
        when(warehouseRepository.save(any(Warehouse.class))).thenAnswer(invocation -> {
            Warehouse w = invocation.getArgument(0);
            w.setId(2L);
            return w;
        });

        WarehouseDTO result = warehouseService.createWarehouse(req);
        assertNotNull(result);
        assertEquals("Central Hub", result.getName());
        assertEquals("WH-CENTRAL", result.getCode());
        assertEquals(WarehouseStatus.ACTIVE, result.getStatus());
    }

    @Test
    @DisplayName("Add inventory stock - Records AVAILABLE movement")
    void testAddInventoryStock() {
        UpdateWarehouseStockRequest req = new UpdateWarehouseStockRequest();
        req.setProductId(101L);
        req.setQuantity(50);
        req.setNotes("Initial stock intake");

        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 0, 0);

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(mainWarehouse));
        when(productRepository.findById(101L)).thenReturn(Optional.of(product));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L))
                .thenReturn(Optional.of(inventory));
        when(warehouseInventoryRepository.save(any(WarehouseInventory.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        WarehouseInventoryDTO dto = warehouseService.addOrUpdateInventoryStock(1L, req);

        assertEquals(50, dto.getAvailableQuantity());
        verify(stockMovementLogRepository, times(1)).save(argThat(log ->
                log.getStage() == StockMovementStage.AVAILABLE && log.getQuantity() == 50
        ));
    }

    @Test
    @DisplayName("Allocate stock to Order - Success")
    void testAllocateOrderSuccess() {
        AllocateOrderRequest req = new AllocateOrderRequest(501L, 1L);
        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 20, 0);

        when(orderRepository.findById(501L)).thenReturn(Optional.of(order));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(mainWarehouse));
        when(warehouseOrderAllocationRepository.findByOrderId(501L)).thenReturn(new ArrayList<>());
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));
        when(warehouseOrderAllocationRepository.save(any(WarehouseOrderAllocation.class))).thenAnswer(inv -> inv.getArgument(0));

        List<WarehouseOrderAllocationDTO> allocations = warehouseService.allocateOrder(req);

        assertEquals(1, allocations.size());
        assertEquals(WarehouseAllocationStatus.ALLOCATED, allocations.get(0).getStatus());
        assertEquals(18, inventory.getAvailableQuantity());
        assertEquals(2, inventory.getAllocatedQuantity());

        verify(stockMovementLogRepository, times(1)).save(argThat(log ->
                log.getStage() == StockMovementStage.ALLOCATED && log.getQuantity() == 2
        ));
    }

    @Test
    @DisplayName("Allocate stock to Order - Insufficient Stock throws Exception")
    void testAllocateOrderInsufficientStock() {
        AllocateOrderRequest req = new AllocateOrderRequest(501L, 1L);
        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 1, 0);

        when(orderRepository.findById(501L)).thenReturn(Optional.of(order));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(mainWarehouse));
        when(warehouseOrderAllocationRepository.findByOrderId(501L)).thenReturn(new ArrayList<>());
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> warehouseService.allocateOrder(req));
        assertTrue(ex.getMessage().contains("Insufficient available stock"));
    }

    @Test
    @DisplayName("Pick, Pack, Ready For Shipment - Stepwise workflow execution")
    void testFulfillmentWorkflowSteps() {
        WarehouseOrderAllocation allocation = new WarehouseOrderAllocation(order, orderItem, mainWarehouse, product, 2, WarehouseAllocationStatus.ALLOCATED);
        allocation.setId(10L);

        when(warehouseOrderAllocationRepository.findById(10L)).thenReturn(Optional.of(allocation));
        when(warehouseOrderAllocationRepository.save(any(WarehouseOrderAllocation.class))).thenAnswer(inv -> inv.getArgument(0));

        // 1. Pick (staff assigned to warehouse 1L)
        WarehouseOrderAllocationDTO picked = warehouseService.pickAllocation(10L, 1L);
        assertEquals(WarehouseAllocationStatus.PICKED, picked.getStatus());
        verify(stockMovementLogRepository, times(1)).save(argThat(log -> log.getStage() == StockMovementStage.PICKED));

        // 2. Pack (staff assigned to warehouse 1L)
        WarehouseOrderAllocationDTO packed = warehouseService.packAllocation(10L, 1L);
        assertEquals(WarehouseAllocationStatus.PACKED, packed.getStatus());
        verify(stockMovementLogRepository, times(1)).save(argThat(log -> log.getStage() == StockMovementStage.PACKED));

        // 3. Ready For Shipment (staff assigned to warehouse 1L)
        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 18, 2);
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));
        when(warehouseOrderAllocationRepository.findByOrderId(501L)).thenReturn(List.of(allocation));

        WarehouseOrderAllocationDTO ready = warehouseService.readyForShipmentAllocation(10L, 1L);
        assertEquals(WarehouseAllocationStatus.READY_FOR_SHIPMENT, ready.getStatus());
        assertEquals(0, inventory.getAllocatedQuantity());
        verify(stockMovementLogRepository, times(1)).save(argThat(log -> log.getStage() == StockMovementStage.READY_FOR_SHIPMENT));
        verify(orderRepository, times(1)).save(argThat(o -> o.getStatus() == OrderStatus.READY_FOR_SHIPPING));
    }

    @Test
    @DisplayName("processStaffQC PASSED - Restocks available inventory and accepts return")
    void testProcessStaffQCPassed() {
        Customer staff = new Customer();
        staff.setId(20L);
        staff.setEmail("staff@shopstack.com");
        staff.setRole(Role.WAREHOUSE_STAFF);
        staff.setWarehouse(mainWarehouse);

        order.setWarehouse(mainWarehouse);
        ReturnRequest ret = new ReturnRequest();
        ret.setId(801L);
        ret.setOrder(order);
        ret.setOrderItem(orderItem);
        ret.setQuantity(2);
        ret.setReturnStatus(ReturnStatus.RETURN_APPROVED);

        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 10, 0);

        when(customerRepository.findByEmail("staff@shopstack.com")).thenReturn(Optional.of(staff));
        when(returnRequestRepository.findById(801L)).thenReturn(Optional.of(ret));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));
        when(warehouseInventoryRepository.findByProductId(101L)).thenReturn(List.of(inventory));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseQCRequestDto qcDto = new WarehouseQCRequestDto(QCResult.PASSED, null, "Item clean and functional", null);

        ReturnRequestDTO dto = warehouseService.processStaffQC(801L, "staff@shopstack.com", qcDto);

        assertNotNull(dto);
        assertEquals(ReturnStatus.RETURN_ACCEPTED, dto.getReturnStatus());
        assertEquals(QCResult.PASSED, dto.getQcResult());
        assertEquals(12, inventory.getAvailableQuantity());
    }

    @Test
    @DisplayName("processStaffQC DAMAGED (SELLER) - Increments damaged stock and accepts return for refund")
    void testProcessStaffQCDamagedSeller() {
        Customer staff = new Customer();
        staff.setId(20L);
        staff.setEmail("staff@shopstack.com");
        staff.setRole(Role.WAREHOUSE_STAFF);
        staff.setWarehouse(mainWarehouse);

        order.setWarehouse(mainWarehouse);
        ReturnRequest ret = new ReturnRequest();
        ret.setId(802L);
        ret.setOrder(order);
        ret.setOrderItem(orderItem);
        ret.setQuantity(2);
        ret.setReturnStatus(ReturnStatus.RETURN_APPROVED);

        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 10, 0);

        when(customerRepository.findByEmail("staff@shopstack.com")).thenReturn(Optional.of(staff));
        when(returnRequestRepository.findById(802L)).thenReturn(Optional.of(ret));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseQCRequestDto qcDto = new WarehouseQCRequestDto(QCResult.DAMAGED, DamageType.PHYSICAL, "Factory defect", DamageResponsibility.SELLER);

        ReturnRequestDTO dto = warehouseService.processStaffQC(802L, "staff@shopstack.com", qcDto);

        assertNotNull(dto);
        assertEquals(ReturnStatus.RETURN_ACCEPTED, dto.getReturnStatus());
        assertEquals(QCResult.DAMAGED, dto.getQcResult());
        assertEquals(DamageResponsibility.SELLER, dto.getDamageResponsibility());
        assertEquals(2, inventory.getDamagedQuantity());
    }

    @Test
    @DisplayName("processStaffQC DAMAGED (CUSTOMER) - Increments damaged stock and REJECTS return per policy")
    void testProcessStaffQCDamagedCustomer() {
        Customer staff = new Customer();
        staff.setId(20L);
        staff.setEmail("staff@shopstack.com");
        staff.setRole(Role.WAREHOUSE_STAFF);
        staff.setWarehouse(mainWarehouse);

        order.setWarehouse(mainWarehouse);
        ReturnRequest ret = new ReturnRequest();
        ret.setId(803L);
        ret.setOrder(order);
        ret.setOrderItem(orderItem);
        ret.setQuantity(1);
        ret.setReturnStatus(ReturnStatus.RETURN_APPROVED);

        WarehouseInventory inventory = new WarehouseInventory(mainWarehouse, product, 10, 0);

        when(customerRepository.findByEmail("staff@shopstack.com")).thenReturn(Optional.of(staff));
        when(returnRequestRepository.findById(803L)).thenReturn(Optional.of(ret));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inventory));
        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        WarehouseQCRequestDto qcDto = new WarehouseQCRequestDto(QCResult.DAMAGED, DamageType.WATER_DAMAGE, "Customer spilled coffee", DamageResponsibility.CUSTOMER);

        ReturnRequestDTO dto = warehouseService.processStaffQC(803L, "staff@shopstack.com", qcDto);

        assertNotNull(dto);
        assertEquals(ReturnStatus.RETURN_REJECTED, dto.getReturnStatus());
        assertEquals(DamageResponsibility.CUSTOMER, dto.getDamageResponsibility());
        assertEquals(1, inventory.getDamagedQuantity());
    }

    @Test
    @DisplayName("processStaffQC Admin role blocked from executing QC")
    void testProcessStaffQCAdminBlocked() {
        Customer admin = new Customer();
        admin.setId(5L);
        admin.setEmail("admin@shopstack.com");
        admin.setRole(Role.ADMIN);

        when(customerRepository.findByEmail("admin@shopstack.com")).thenReturn(Optional.of(admin));

        WarehouseQCRequestDto qcDto = new WarehouseQCRequestDto(QCResult.PASSED, null, null, null);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> warehouseService.processStaffQC(801L, "admin@shopstack.com", qcDto));
        assertTrue(ex.getMessage().contains("Admin is not permitted to perform Quality Control"));
    }
}
