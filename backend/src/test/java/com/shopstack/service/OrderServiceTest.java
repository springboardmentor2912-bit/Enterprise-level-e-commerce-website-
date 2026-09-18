package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.model.*;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorProfileRepository vendorProfileRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("4.1 Order Creation - Single Vendor COD order")
    void testCreateOrder_SingleVendor_COD() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        int initialStock = product.getStockQuantity();

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.COD);
        request.setShippingAddress("123 Test Street, Silicon Valley, CA, 94025");
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 2)));

        List<Order> orders = orderService.createOrders(customer.getId(), request);

        assertNotNull(orders);
        assertEquals(1, orders.size());
        Order createdOrder = orders.get(0);

        assertEquals(OrderStatus.PENDING, createdOrder.getStatus());
        assertEquals(PaymentStatus.PENDING_COD, createdOrder.getPaymentStatus());
        assertEquals(PaymentMethod.COD, createdOrder.getPaymentMethod());
        assertEquals(1, createdOrder.getItems().size());
        assertEquals(2, createdOrder.getItems().get(0).getQuantity());

        // For COD order in PENDING state, stock is not deducted until confirmation
        Product reloadedProduct = productRepository.findById(product.getId()).get();
        assertEquals(initialStock, reloadedProduct.getStockQuantity());
    }

    @Test
    @DisplayName("4.2 Order Creation - Multi-Vendor Cart Splitting")
    void testCreateOrder_MultiVendor_Splitting() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        List<VendorProfile> vendors = vendorProfileRepository.findAll();
        assertTrue(vendors.size() >= 2, "Requires at least 2 vendors seeded");

        Product productV1 = productRepository.findByVendorProfileId(vendors.get(0).getId()).get(0);
        Product productV2 = productRepository.findByVendorProfileId(vendors.get(1).getId()).get(0);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.CARD);
        request.setShippingAddress("456 Market Lane, Tech Park, Bangalore, 560001");
        request.setItems(List.of(
                new CreateOrderRequest.OrderItemRequest(productV1.getId(), 1),
                new CreateOrderRequest.OrderItemRequest(productV2.getId(), 2)
        ));

        List<Order> orders = orderService.createOrders(customer.getId(), request);

        assertNotNull(orders);
        assertEquals(2, orders.size(), "Multi-vendor cart must split into 2 separate vendor orders");

        assertTrue(orders.stream().anyMatch(o -> o.getVendorProfile().getId().equals(vendors.get(0).getId())));
        assertTrue(orders.stream().anyMatch(o -> o.getVendorProfile().getId().equals(vendors.get(1).getId())));
    }

    @Test
    @DisplayName("4.3 Order Creation - Insufficient Stock Prevention")
    void testCreateOrder_InsufficientStock_ThrowsException() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().get(0);

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.CARD);
        // Request excessive quantity
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), product.getStockQuantity() + 1000)));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.createOrders(customer.getId(), request));
        assertTrue(ex.getMessage().contains("Insufficient stock") || ex.getMessage().contains("Out of Stock"));
    }

    @Test
    @DisplayName("4.4 Order Lifecycle - Full Status Progression")
    void testOrderStatusProgression() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 10).findFirst().get();

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.COD);
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 2)));

        List<Order> orders = orderService.createOrders(customer.getId(), request);
        Order order = orders.get(0);
        assertEquals(OrderStatus.PENDING, order.getStatus());

        // 1. Confirm order (Deducts stock)
        Order confirmed = orderService.updateOrderStatus(order.getId(), OrderStatus.CONFIRMED);
        assertEquals(OrderStatus.CONFIRMED, confirmed.getStatus());
        assertEquals(PaymentStatus.PAID, confirmed.getPaymentStatus());

        // 2. Processing
        Order processing = orderService.updateOrderStatus(order.getId(), OrderStatus.PROCESSING);
        assertEquals(OrderStatus.PROCESSING, processing.getStatus());

        // 3. Shipped
        Order shipped = orderService.updateOrderStatus(order.getId(), OrderStatus.SHIPPED);
        assertEquals(OrderStatus.SHIPPED, shipped.getStatus());

        // 4. Delivered
        Order delivered = orderService.updateOrderStatus(order.getId(), OrderStatus.DELIVERED);
        assertEquals(OrderStatus.DELIVERED, delivered.getStatus());
    }

    @Test
    @DisplayName("4.5 Order Cancellation - Stock Restoration & Deallocation")
    void testOrderCancellation_RestoresCatalogStock() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 10).findFirst().get();

        int initialStock = product.getStockQuantity();

        // 1. Create immediate online confirmed order (deducts 3 units)
        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.CARD);
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 3)));

        List<Order> orders = orderService.createOrders(customer.getId(), request);
        Order order = orders.get(0);
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());

        Product productAfterOrder = productRepository.findById(product.getId()).get();
        assertEquals(initialStock - 3, productAfterOrder.getStockQuantity());

        // 2. Cancel the order -> Stock should be restored
        Order cancelled = orderService.updateOrderStatus(order.getId(), OrderStatus.CANCELLED);
        assertEquals(OrderStatus.CANCELLED, cancelled.getStatus());
        assertEquals(PaymentStatus.REFUNDED, cancelled.getPaymentStatus());

        Product productAfterCancel = productRepository.findById(product.getId()).get();
        assertEquals(initialStock, productAfterCancel.getStockQuantity(), "Catalog stock must be completely restored upon order cancellation");
    }
}
