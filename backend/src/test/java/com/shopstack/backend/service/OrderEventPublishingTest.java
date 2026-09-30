package com.shopstack.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.transaction.annotation.Transactional;

import com.razorpay.RazorpayClient;
import com.shopstack.backend.event.OrderDeliveredEvent;
import com.shopstack.backend.event.OrderPlacedEvent;
import com.shopstack.backend.event.OrderShippedEvent;
import com.shopstack.backend.event.PaymentFailedEvent;
import com.shopstack.backend.event.PaymentSuccessEvent;
import com.shopstack.backend.event.RefundCompletedEvent;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;

@SpringBootTest
@RecordApplicationEvents
@Transactional
public class OrderEventPublishingTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ApplicationEvents applicationEvents;

    @MockitoBean
    private JavaMailSender mailSender;

    private User testCustomer;
    private Product testProduct;

    @BeforeEach
    public void setup() {
        when(mailSender.createMimeMessage()).thenReturn(new jakarta.mail.internet.MimeMessage((jakarta.mail.Session) null));

        testCustomer = new User(
                "Alice Customer",
                "alice_" + System.currentTimeMillis() + "@shopstack.com",
                "pass123",
                "CUSTOMER",
                "9876543210",
                "123 Market St"
        );
        testCustomer = userRepository.save(testCustomer);

        testProduct = new Product();
        testProduct.setName("Notification Test Product");
        testProduct.setPrice(1200.0);
        testProduct.setStock(50);
        testProduct.setVendorId(1L);
        testProduct = productRepository.save(testProduct);
    }

    @Test
    @DisplayName("Placing a verified order publishes OrderPlacedEvent and PaymentSuccessEvent")
    public void testPlaceVerifiedOrder_PublishesEvents() {
        List<Map<String, Object>> cartItems = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("id", testProduct.getId());
        item.put("name", testProduct.getName());
        item.put("price", 1200.0);
        item.put("quantity", 1);
        cartItems.add(item);

        Map<String, Object> deliveryInfo = new HashMap<>();
        deliveryInfo.put("name", "Alice Customer");
        deliveryInfo.put("phone", "9876543210");
        deliveryInfo.put("address", "123 Market St");

        Order placedOrder = paymentService.placeVerifiedOrder(
                testCustomer.getId(),
                cartItems,
                "RAZORPAY",
                "order_rzp_123",
                "pay_rzp_123",
                deliveryInfo,
                null
        );

        assertNotNull(placedOrder);

        // Verify OrderPlacedEvent was published
        long orderPlacedCount = applicationEvents.stream(OrderPlacedEvent.class).count();
        assertTrue(orderPlacedCount >= 1, "OrderPlacedEvent should have been published");

        OrderPlacedEvent placedEvent = applicationEvents.stream(OrderPlacedEvent.class)
                .filter(e -> e.getOrder().getOrderId().equals(placedOrder.getOrderId()))
                .findFirst()
                .orElse(null);
        assertNotNull(placedEvent);
        assertEquals(placedOrder.getOrderId(), placedEvent.getOrder().getOrderId());
        assertEquals(testCustomer.getId(), placedEvent.getUser().getId());

        // Verify PaymentSuccessEvent was published
        long paymentSuccessCount = applicationEvents.stream(PaymentSuccessEvent.class).count();
        assertTrue(paymentSuccessCount >= 1, "PaymentSuccessEvent should have been published for PAID order");

        PaymentSuccessEvent paymentEvent = applicationEvents.stream(PaymentSuccessEvent.class)
                .filter(e -> e.getOrder().getOrderId().equals(placedOrder.getOrderId()))
                .findFirst()
                .orElse(null);
        assertNotNull(paymentEvent);
        assertEquals("pay_rzp_123", paymentEvent.getPaymentId());
    }

    @Test
    @DisplayName("Recording a payment failure publishes PaymentFailedEvent")
    public void testRecordFailedPayment_PublishesEvent() {
        Map<String, Object> deliveryInfo = new HashMap<>();
        deliveryInfo.put("name", "Alice Customer");
        deliveryInfo.put("email", testCustomer.getEmail());

        paymentService.recordFailedPayment(
                testCustomer.getId(),
                "order_rzp_failed_123",
                "Card declined by issuing bank",
                1200.0,
                Collections.emptyList(),
                deliveryInfo
        );

        long failedEventCount = applicationEvents.stream(PaymentFailedEvent.class).count();
        assertTrue(failedEventCount >= 1, "PaymentFailedEvent should have been published");

        PaymentFailedEvent failedEvent = applicationEvents.stream(PaymentFailedEvent.class)
                .filter(e -> "order_rzp_failed_123".equals(e.getRazorpayOrderId()))
                .findFirst()
                .orElse(null);
        assertNotNull(failedEvent);
        assertEquals("Card declined by issuing bank", failedEvent.getFailureReason());
        assertEquals(1200.0, failedEvent.getAmount());
    }

    @Test
    @DisplayName("Processing a refund publishes RefundCompletedEvent")
    public void testProcessRefund_PublishesEvent() throws Exception {
        // Create an initial paid order
        Order newOrder = new Order(
                "ORD-REF-" + (int)(100000 + Math.random() * 900000),
                testCustomer.getId(),
                "Jan 10, 2026",
                1200.0,
                "DELIVERED",
                "PAID",
                "RAZORPAY",
                "order_rzp_ref_1",
                "pay_rzp_ref_1",
                "Alice",
                "9876543210",
                "123 Market St"
        );
        final Order savedOrder = orderRepository.save(newOrder);

        Refund refund = paymentService.processRefund(savedOrder.getOrderId(), 1200.0, "Customer returned product");
        assertNotNull(refund);

        long refundEventCount = applicationEvents.stream(RefundCompletedEvent.class).count();
        assertTrue(refundEventCount >= 1, "RefundCompletedEvent should have been published");

        RefundCompletedEvent refEvent = applicationEvents.stream(RefundCompletedEvent.class)
                .filter(e -> savedOrder.getOrderId().equals(e.getOrder().getOrderId()))
                .findFirst()
                .orElse(null);
        assertNotNull(refEvent);
        assertEquals(1200.0, refEvent.getRefund().getAmount());
    }
}
