package com.shopstack.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopstack.dto.CreateReturnRequestDto;
import com.shopstack.dto.ReturnRequestDTO;
import com.shopstack.entity.*;
import com.shopstack.repository.*;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ReturnServiceImplTest {

    @Mock
    private ReturnRequestRepository returnRequestRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private WarehouseRepository warehouseRepository;
    @Mock
    private WarehouseInventoryRepository warehouseInventoryRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private StockMovementLogRepository stockMovementLogRepository;
    @Mock
    private InventoryHistoryRepository inventoryHistoryRepository;
    @Mock
    private NotificationService notificationService;

    private ReturnServiceImpl returnService;

    private Customer testCustomer;
    private Order testOrder;
    private OrderItem testOrderItem;
    private Payment testPayment;

    // Test overrides for Razorpay SDK calls
    private com.razorpay.Payment mockRzpPayment;
    private com.razorpay.Refund mockRzpRefund;
    private RazorpayException mockRazorpayException;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setEmail("customer@example.com");

        testOrder = new Order();
        testOrder.setId(100L);
        testOrder.setCustomer(testCustomer);
        testOrder.setStatus(OrderStatus.DELIVERED);
        testOrder.setGrossAmount(new BigDecimal("300.00"));
        testOrder.setDiscountAmount(new BigDecimal("80.01"));
        testOrder.setTotalAmount(new BigDecimal("219.99"));
        ReflectionTestUtils.setField(testOrder, "createdAt", LocalDateTime.now());

        testOrderItem = new OrderItem();
        testOrderItem.setId(10L);
        testOrderItem.setOrder(testOrder);
        testOrderItem.setQuantity(1);
        testOrderItem.setPriceAtPurchase(new BigDecimal("300.00"));

        testPayment = new Payment();
        testPayment.setId(50L);
        testPayment.setOrder(testOrder);
        testPayment.setCustomer(testCustomer);
        testPayment.setRazorpayOrderId("rzp_order_100");
        testPayment.setRazorpayPaymentId("pay_test_123");
        testPayment.setAmount(new BigDecimal("219.99"));
        testPayment.setStatus(PaymentStatus.PAID);

        mockRzpPayment = null;
        mockRzpRefund = null;
        mockRazorpayException = null;

        // ReturnServiceImpl subclass overriding Razorpay SDK call methods
        returnService = new ReturnServiceImpl(
                returnRequestRepository,
                orderRepository,
                orderItemRepository,
                customerRepository,
                paymentRepository,
                warehouseRepository,
                warehouseInventoryRepository,
                productRepository,
                stockMovementLogRepository,
                inventoryHistoryRepository,
                notificationService
        ) {
            @Override
            protected RazorpayClient createRazorpayClient() {
                return null; // Not needed as fetch and execute helper methods are overridden
            }

            @Override
            protected com.razorpay.Payment fetchRazorpayPayment(RazorpayClient client, String razorpayPaymentId) throws RazorpayException {
                if (mockRazorpayException != null) throw mockRazorpayException;
                return mockRzpPayment;
            }

            @Override
            protected com.razorpay.Refund executeRazorpayRefund(RazorpayClient client, String razorpayPaymentId, JSONObject refundRequest) throws RazorpayException {
                if (mockRazorpayException != null) throw mockRazorpayException;
                return mockRzpRefund;
            }
        };

        when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> {
            ReturnRequest r = invocation.getArgument(0);
            if (r.getId() == null) r.setId(1L);
            return r;
        });

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("requestReturn calculates refund amount based on actual amount paid after discount")
    void testRequestReturn_CalculatesRefundAmountPostDiscount() {
        when(customerRepository.findByEmail("customer@example.com")).thenReturn(Optional.of(testCustomer));
        when(orderItemRepository.findById(10L)).thenReturn(Optional.of(testOrderItem));
        when(returnRequestRepository.existsByOrderItemIdAndReturnStatusIn(eq(10L), any())).thenReturn(false);

        CreateReturnRequestDto dto = new CreateReturnRequestDto();
        dto.setQuantity(1);
        dto.setReason("Item defective");

        ReturnRequestDTO result = returnService.requestReturn("customer@example.com", 10L, dto);

        assertNotNull(result);
        // Gross was 300.00, Discount was 80.01, Total Paid was 219.99
        // 300.00 * (219.99 / 300.00) = 219.99
        assertEquals(new BigDecimal("219.99"), result.getRefundAmount());

        ArgumentCaptor<ReturnRequest> captor = ArgumentCaptor.forClass(ReturnRequest.class);
        verify(returnRequestRepository).save(captor.capture());
        assertEquals(new BigDecimal("219.99"), captor.getValue().getRefundAmount());
    }

    @Test
    @DisplayName("initiateRefund successfully processes Razorpay refund and updates Order to REFUNDED")
    void testInitiateRefund_SuccessFlow() {
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(1L);
        returnRequest.setOrder(testOrder);
        returnRequest.setOrderItem(testOrderItem);
        returnRequest.setCustomer(testCustomer);
        returnRequest.setQuantity(1);
        returnRequest.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);
        returnRequest.setRefundAmount(new BigDecimal("219.99"));

        when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));
        when(returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(100L))
                .thenReturn(Collections.singletonList(returnRequest));

        JSONObject jsonPayment = new JSONObject();
        jsonPayment.put("id", "pay_test_123");
        jsonPayment.put("amount", 21999);
        jsonPayment.put("amount_refunded", 0);
        mockRzpPayment = new com.razorpay.Payment(jsonPayment);

        JSONObject jsonRefund = new JSONObject();
        jsonRefund.put("id", "rfnd_test_999");
        jsonRefund.put("status", "processed");
        mockRzpRefund = new com.razorpay.Refund(jsonRefund);

        ReturnRequestDTO dto = returnService.initiateRefund(1L);

        assertNotNull(dto);
        assertEquals("rfnd_test_999", dto.getRazorpayRefundId());
        assertEquals(ReturnStatus.REFUNDED, dto.getReturnStatus());
        assertEquals(PaymentStatus.REFUNDED, testPayment.getStatus());
        assertEquals(OrderStatus.REFUNDED, testOrder.getStatus());
    }

    @Test
    @DisplayName("initiateRefund throws error when requested refund exceeds remaining refundable amount")
    void testInitiateRefund_ExceedsRemainingRefundable_ThrowsClearError() {
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(1L);
        returnRequest.setOrder(testOrder);
        returnRequest.setOrderItem(testOrderItem);
        returnRequest.setCustomer(testCustomer);
        returnRequest.setQuantity(1);
        returnRequest.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);
        returnRequest.setRefundAmount(new BigDecimal("150.00")); // Requested ₹150.00

        when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));
        when(returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(100L))
                .thenReturn(Collections.singletonList(returnRequest));

        // Captured = 21999 (₹219.99), Already refunded = 10000 (₹100.00) => Remaining = ₹119.99
        JSONObject jsonPayment = new JSONObject();
        jsonPayment.put("id", "pay_test_123");
        jsonPayment.put("amount", 21999);
        jsonPayment.put("amount_refunded", 10000);
        mockRzpPayment = new com.razorpay.Payment(jsonPayment);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> returnService.initiateRefund(1L));

        assertTrue(ex.getMessage().contains("greater than the remaining refundable amount of ₹119.99"));
        assertTrue(ex.getMessage().contains("Captured payment: ₹219.99"));
        assertTrue(ex.getMessage().contains("Already refunded: ₹100.00"));

        // Verify order status was NOT changed to REFUNDED
        assertNotEquals(OrderStatus.REFUNDED, testOrder.getStatus());
    }

    @Test
    @DisplayName("initiateRefund prevents duplicate refunds if already refunded")
    void testInitiateRefund_PreventDuplicateRefund() {
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(1L);
        returnRequest.setOrder(testOrder);
        returnRequest.setReturnStatus(ReturnStatus.REFUNDED);
        returnRequest.setRazorpayRefundId("rfnd_already_done");

        when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> returnService.initiateRefund(1L));

        assertTrue(ex.getMessage().contains("has already been refunded"));
    }

    @Test
    @DisplayName("initiateRefund does NOT set Order to REFUNDED if Razorpay API fails")
    void testInitiateRefund_RazorpayApiFails_DoesNotSetOrderStatusToRefunded() {
        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setId(1L);
        returnRequest.setOrder(testOrder);
        returnRequest.setOrderItem(testOrderItem);
        returnRequest.setCustomer(testCustomer);
        returnRequest.setQuantity(1);
        returnRequest.setReturnStatus(ReturnStatus.RETURN_ACCEPTED);
        returnRequest.setRefundAmount(new BigDecimal("219.99"));

        when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));
        when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));
        when(returnRequestRepository.findByOrderIdOrderByCreatedAtDesc(100L))
                .thenReturn(Collections.singletonList(returnRequest));

        JSONObject jsonPayment = new JSONObject();
        jsonPayment.put("id", "pay_test_123");
        jsonPayment.put("amount", 21999);
        jsonPayment.put("amount_refunded", 0);
        mockRzpPayment = new com.razorpay.Payment(jsonPayment);

        mockRazorpayException = new RazorpayException("BAD_REQUEST_ERROR: Payment does not exist");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> returnService.initiateRefund(1L));

        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("Refund failed via Razorpay") || ex.getMessage().contains("BAD_REQUEST_ERROR"));
        assertEquals(ReturnStatus.REFUND_FAILED, returnRequest.getReturnStatus());
        assertEquals(PaymentStatus.REFUND_FAILED, testPayment.getStatus());
        // Order status MUST NOT be set to REFUNDED
        assertNotEquals(OrderStatus.REFUNDED, testOrder.getStatus());
    }
}
