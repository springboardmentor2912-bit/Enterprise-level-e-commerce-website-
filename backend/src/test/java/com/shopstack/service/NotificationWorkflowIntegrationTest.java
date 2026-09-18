package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentVerificationRequest;
import com.shopstack.dto.QcInspectionDto;
import com.shopstack.dto.ReturnRequestDto;
import com.shopstack.dto.ReturnResponseDto;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class NotificationWorkflowIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("Integration 1: Automatic Order Placed Notification on COD Order Creation")
    void testOrderPlacedNotification_OnCODOrder() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest req = new CreateOrderRequest();
        req.setPaymentMethod(PaymentMethod.COD);
        req.setShippingAddress("789 Integration Lane, Metropolis");
        req.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        List<Order> createdOrders = orderService.createOrders(customer.getId(), req);
        assertNotNull(createdOrders);
        assertFalse(createdOrders.isEmpty());

        Order order = createdOrders.get(0);

        List<Notification> notifs = notificationRepository.findByReferenceIdOrderByCreatedAtDesc(order.getOrderNumber());
        assertFalse(notifs.isEmpty());
        Notification orderNotif = notifs.get(0);
        assertEquals(NotificationType.ORDER_PLACED, orderNotif.getType());
        assertEquals(customer.getEmail(), orderNotif.getRecipientEmail());
        assertTrue(orderNotif.getBodyHtml().contains(order.getOrderNumber()));
    }

    @Test
    @DisplayName("Integration 2: Automatic Payment Failed Notification")
    void testPaymentFailedNotification() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();

        Payment payment = Payment.builder()
                .razorpayOrderId("order_rzp_test_fail_999")
                .amount(1999.0)
                .status(PaymentStatus.PENDING)
                .customer(customer)
                .build();
        paymentRepository.save(payment);

        paymentService.handlePaymentFailure("order_rzp_test_fail_999", "User cancelled transaction on gateway.");

        List<Notification> notifs = notificationRepository.findByReferenceIdOrderByCreatedAtDesc("order_rzp_test_fail_999");
        assertFalse(notifs.isEmpty());
        Notification failedNotif = notifs.get(0);
        assertEquals(NotificationType.PAYMENT_FAILED, failedNotif.getType());
        assertEquals(customer.getEmail(), failedNotif.getRecipientEmail());
        assertTrue(failedNotif.getBodyHtml().contains("Payment Attempt Failed"));
    }

    @Test
    @DisplayName("Integration 3: Automatic Order Shipped & Delivered Notifications")
    void testOrderShippedAndDeliveredNotifications() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest req = new CreateOrderRequest();
        req.setPaymentMethod(PaymentMethod.CARD);
        req.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        List<Order> created = orderService.createOrders(customer.getId(), req);
        Order order = created.get(0);

        // Update status to SHIPPED
        Order shippedOrder = orderService.updateOrderStatus(order.getId(), OrderStatus.SHIPPED);
        assertEquals(OrderStatus.SHIPPED, shippedOrder.getStatus());

        List<Notification> shippedNotifs = notificationRepository.findByReferenceIdOrderByCreatedAtDesc(order.getOrderNumber());
        assertTrue(shippedNotifs.stream().anyMatch(n -> n.getType() == NotificationType.ORDER_SHIPPED));

        // Update status to DELIVERED
        Order deliveredOrder = orderService.updateOrderStatus(order.getId(), OrderStatus.DELIVERED);
        assertEquals(OrderStatus.DELIVERED, deliveredOrder.getStatus());

        List<Notification> allNotifs = notificationRepository.findByReferenceIdOrderByCreatedAtDesc(order.getOrderNumber());
        assertTrue(allNotifs.stream().anyMatch(n -> n.getType() == NotificationType.ORDER_DELIVERED));
    }

    @Test
    @DisplayName("Integration 4: Automatic Refund Completed Notification on QC Inspection")
    void testRefundCompletedNotification_OnQcInspection() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setPaymentMethod(PaymentMethod.CARD);
        orderReq.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        List<Order> orders = orderService.createOrders(customer.getId(), orderReq);
        Order order = orders.get(0);
        orderService.updateOrderStatus(order.getId(), OrderStatus.DELIVERED);

        // Customer requests return
        ReturnRequestDto returnDto = new ReturnRequestDto(order.getId(), null, "Defective product", "DEFECTIVE", "Speaker buzzing");
        ReturnResponseDto requestedReturn = warehouseService.requestReturn(customer.getId(), returnDto);

        // Warehouse receives & inspects return
        warehouseService.receiveReturnAtWarehouse(requestedReturn.getId(), "QC Lead Inspector");

        QcInspectionDto qcDto = new QcInspectionDto("PASS", "Item verified intact, approved for restock and full refund.", "Senior QC Lead");
        ReturnResponseDto qcResult = warehouseService.performQcInspection(requestedReturn.getId(), qcDto, 99L);

        assertEquals("QC_PASSED_RESTOCKED", qcResult.getStatus());

        List<Notification> refundNotifs = notificationRepository.findByReferenceIdOrderByCreatedAtDesc(order.getOrderNumber());
        assertTrue(refundNotifs.stream().anyMatch(n -> n.getType() == NotificationType.REFUND_COMPLETED));
    }
}
