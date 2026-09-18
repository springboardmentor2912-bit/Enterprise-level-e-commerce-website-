package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
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
class OrderServiceImplTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private VendorRepository vendorRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private InventoryHistoryRepository inventoryHistoryRepository;
    @Mock
    private CouponService couponService;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private CouponUsageRepository couponUsageRepository;
    @Mock
    private WarehouseService warehouseService;
    @Mock
    private ShipmentRepository shipmentRepository;
    @Mock
    private WarehouseOrderAllocationRepository warehouseOrderAllocationRepository;
    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;
    @Mock
    private StockMovementLogRepository stockMovementLogRepository;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Customer customer;
    private Product product;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setEmail("customer@test.com");
        customer.setAddress("123 Main Street");

        Vendor vendor = new Vendor();
        vendor.setId(5L);
        vendor.setCommissionRate(new BigDecimal("10.00"));

        product = new Product();
        product.setId(101L);
        product.setName("Gaming Keyboard");
        product.setPrice(new BigDecimal("1500.00"));
        product.setStockQuantity(5);
        product.setVendor(vendor);
        product.setApprovalStatus(ApprovalStatus.APPROVED);

        cartItem = new CartItem(customer, product, 2);
    }

    @Test
    @DisplayName("checkout SUCCESS - Deducts stock and places CONFIRMED order")
    void testCheckoutSuccess() {
        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByCustomerId(1L)).thenReturn(List.of(cartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(500L);
            return o;
        });

        CreateOrderRequest req = new CreateOrderRequest();
        req.setShippingAddress("123 Main Street");

        OrderDTO dto = orderService.checkout("customer@test.com", req);

        assertNotNull(dto);
        assertEquals(OrderStatus.CONFIRMED, dto.getStatus());
        assertEquals(3, product.getStockQuantity()); // 5 - 2 = 3
        verify(productRepository, times(1)).save(product);
        verify(cartItemRepository, times(1)).deleteByCustomerId(1L);
    }

    @Test
    @DisplayName("checkout FAIL - Insufficient product stock")
    void testCheckoutInsufficientStock() {
        product.setStockQuantity(1); // Cart has 2
        when(customerRepository.findByEmail("customer@test.com")).thenReturn(Optional.of(customer));
        when(cartItemRepository.findByCustomerId(1L)).thenReturn(List.of(cartItem));

        CreateOrderRequest req = new CreateOrderRequest();
        req.setShippingAddress("123 Main Street");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> orderService.checkout("customer@test.com", req));

        assertTrue(ex.getMessage().contains("Insufficient stock for product: Gaming Keyboard"));
    }

    @Test
    @DisplayName("cancelOrder SUCCESS - Restores product stock and warehouse inventory")
    void testCancelOrderSuccess() {
        Order order = new Order();
        order.setId(500L);
        order.setCustomer(customer);
        order.setStatus(OrderStatus.CONFIRMED);

        OrderItem orderItem = new OrderItem(order, product, product.getVendor(), 2, product.getPrice(), new BigDecimal("10.00"), new BigDecimal("300.00"), new BigDecimal("2700.00"));
        order.setItems(List.of(orderItem));

        Warehouse wh = new Warehouse("Main WH", "WH-001", "City Center", "+1234567890", WarehouseStatus.ACTIVE);
        wh.setId(1L);

        WarehouseInventory inv = new WarehouseInventory(wh, product, 10, 2);

        WarehouseOrderAllocation alloc = new WarehouseOrderAllocation(order, orderItem, wh, product, 2, WarehouseAllocationStatus.ALLOCATED);

        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(warehouseOrderAllocationRepository.findByOrderId(500L)).thenReturn(List.of(alloc));
        when(warehouseInventoryRepository.findByWarehouseIdAndProductId(1L, 101L)).thenReturn(Optional.of(inv));
        when(warehouseInventoryRepository.findByProductId(101L)).thenReturn(List.of(inv));
        when(orderRepository.save(any(Order.class))).thenAnswer(i -> i.getArgument(0));

        OrderDTO dto = orderService.cancelOrder(500L, "customer@test.com");

        assertNotNull(dto);
        assertEquals(OrderStatus.CANCELLED, dto.getStatus());
        assertEquals(12, product.getStockQuantity()); // Synced with warehouse available stock (10 + 2 = 12)
        assertEquals(12, inv.getAvailableQuantity()); // 10 + 2 = 12
        assertEquals(0, inv.getAllocatedQuantity()); // 2 - 2 = 0
        assertEquals(WarehouseAllocationStatus.CANCELLED, alloc.getStatus());
    }

    @Test
    @DisplayName("cancelOrder FAIL - Cannot cancel DELIVERED order")
    void testCancelOrderDeliveredFails() {
        Order order = new Order();
        order.setId(500L);
        order.setCustomer(customer);
        order.setStatus(OrderStatus.DELIVERED);

        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> orderService.cancelOrder(500L, "customer@test.com"));

        assertTrue(ex.getMessage().contains("cannot be cancelled because it is in DELIVERED status"));
    }
}
