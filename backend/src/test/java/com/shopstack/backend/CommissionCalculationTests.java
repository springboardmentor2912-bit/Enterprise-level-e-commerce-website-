package com.shopstack.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.backend.controller.AdminController;
import com.shopstack.backend.controller.CommissionController;
import com.shopstack.backend.controller.VendorController;
import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.repository.UserRepository;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
public class CommissionCalculationTests {

    @Autowired
    private CommissionController commissionController;

    @Autowired
    private AdminController adminController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorController vendorController;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    private User testVendor;

    @BeforeEach
    public void setup() {
        // Create and save a test vendor user
        testVendor = new User(
            "Test Vendor",
            "testvendor_" + System.currentTimeMillis() + "@shopstack.com",
            "password123",
            "VENDOR",
            "1234567890",
            "123 Vendor Lane"
        );
        testVendor = userRepository.save(testVendor);
    }

    @Test
    public void testCase1_Order10000_Commission10Percent() {
        // Order Amount: ₹10,000, Commission: 10%
        // Platform Commission: ₹1,000, Vendor Amount: ₹9,000
        ResponseEntity<?> response = commissionController.calculateCommission(10000.0, null, 10.0);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(10000.0, body.get("orderAmount"));
        assertEquals(10.0, body.get("commissionRate"));
        assertEquals(1000.0, body.get("commissionAmount"));
        assertEquals(9000.0, body.get("vendorAmount"));
    }

    @Test
    public void testCase2_Order5000_Commission5Percent() {
        // Order Amount: ₹5,000, Commission: 5%
        // Platform Commission: ₹250, Vendor Amount: ₹4,750
        ResponseEntity<?> response = commissionController.calculateCommission(5000.0, null, 5.0);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertNotNull(body);
        assertEquals(5000.0, body.get("orderAmount"));
        assertEquals(5.0, body.get("commissionRate"));
        assertEquals(250.0, body.get("commissionAmount"));
        assertEquals(4750.0, body.get("vendorAmount"));
    }

    @Test
    public void testVendorSpecificCommissionCalculation() {
        // 1. Trying to update the vendor's commission rate to 15% via Admin API should be rejected (BAD_REQUEST)
        Map<String, Object> updatePayload = new HashMap<>();
        updatePayload.put("commissionRate", 15.0);

        ResponseEntity<?> updateRes = adminController.updateVendorCommissionRate(testVendor.getId(), updatePayload);
        assertEquals(HttpStatus.BAD_REQUEST, updateRes.getStatusCode());

        // 2. Perform calculation lookup for the vendor without specifying the rate parameter
        // It should ignore any custom rate and evaluate to the fixed 10% rate
        // Order Amount: ₹20,000 -> Platform Commission: ₹2,000, Vendor Amount: ₹18,000
        ResponseEntity<?> calcRes = commissionController.calculateCommission(20000.0, testVendor.getId(), null);
        assertEquals(HttpStatus.OK, calcRes.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) calcRes.getBody();
        assertNotNull(body);
        assertEquals(20000.0, body.get("orderAmount"));
        assertEquals(10.0, body.get("commissionRate")); // Should evaluate to fixed 10.0
        assertEquals(2000.0, body.get("commissionAmount"));
        assertEquals(18000.0, body.get("vendorAmount"));
    }

    @Test
    public void testFallbackToDefaultCommissionCalculation() {
        // If no custom commission rate is set on the vendor, it should fallback to the global default rate (10%)
        ResponseEntity<?> calcRes = commissionController.calculateCommission(20000.0, testVendor.getId(), null);
        assertEquals(HttpStatus.OK, calcRes.getStatusCode());

        @SuppressWarnings("unchecked")
        Map<String, Object> body = (Map<String, Object>) calcRes.getBody();
        assertNotNull(body);
        assertEquals(20000.0, body.get("orderAmount"));
        assertEquals(10.0, body.get("commissionRate")); // fallback to default config percentage
        assertEquals(2000.0, body.get("commissionAmount"));
        assertEquals(18000.0, body.get("vendorAmount"));
    }

    @Test
    public void testCODPaymentSettlementOnDelivery() {
        // 1. Create a test product
        Product product = new Product();
        product.setName("COD Test Product");
        product.setPrice(1500.0);
        product.setStock(10);
        product.setVendorId(testVendor.getId());
        product = productRepository.save(product);

        // 2. Create a COD order with paymentStatus = PENDING and status = CONFIRMED
        String orderId = "ORD-" + (int) (100000 + Math.random() * 900000);
        Order order = new Order(
            orderId,
            testVendor.getId(), // customer ID (reused for test simplicity)
            "Aug 21, 2026",
            1500.0,
            "CONFIRMED",
            "PENDING",
            "COD",
            null,
            null,
            "Recipient",
            "9876543210",
            "Test Address"
        );
        order = orderRepository.save(order);

        // Create OrderItem line
        OrderItem orderItem = new OrderItem(orderId, product.getId(), product.getName(), 1500.0, 1500.0, 0.0, 1, testVendor.getId());
        orderItem = orderItemRepository.save(orderItem);

        // Assert no settlement records exist for this order yet
        List<Settlement> settlementsBefore = settlementRepository.findByOrderId(orderId);
        assertTrue(settlementsBefore.isEmpty());

        // 3. Update order status to DELIVERED via VendorController (simulate delivery event)
        Map<String, String> statusPayload = new HashMap<>();
        statusPayload.put("status", "DELIVERED");

        ResponseEntity<?> response = vendorController.updateOrderStatus(orderId, statusPayload);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        // 4. Assert order payment status has transitioned to PAID
        Order updatedOrder = orderRepository.findAll().stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst()
                .orElseThrow();
        assertEquals("PAID", updatedOrder.getPaymentStatus());
        assertEquals("DELIVERED", updatedOrder.getStatus());

        // 5. Assert settlement record has been created for the vendor
        List<Settlement> settlementsAfter = settlementRepository.findByOrderId(orderId);
        assertEquals(1, settlementsAfter.size());

        Settlement settlement = settlementsAfter.get(0);
        assertEquals(testVendor.getId(), settlement.getVendorId());
        assertEquals(1500.0, settlement.getGrossAmount());
        assertEquals(10.0, settlement.getCommissionPercentage()); // Fallback global default
        assertEquals(150.0, settlement.getCommissionAmount()); // 10% fee
        assertEquals(1350.0, settlement.getNetPayoutAmount()); // Vendor payout
        assertEquals("PENDING", settlement.getStatus());
    }
}
