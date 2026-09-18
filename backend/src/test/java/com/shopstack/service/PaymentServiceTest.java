package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentVerificationRequest;
import com.shopstack.model.*;
import com.shopstack.repository.PaymentRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PaymentServiceTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @DisplayName("5.1 Create Payment Order - Cash On Delivery (COD)")
    void testCreatePaymentOrder_COD() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.COD);
        request.setShippingAddress("789 Cash Delivery Road, Mumbai, 400001");
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        PaymentOrderResponse response = paymentService.createPaymentOrder(customer.getId(), request);

        assertNotNull(response);
        assertEquals("COD", response.getPaymentMethod());
        assertEquals("PENDING_COD", response.getStatus());
        assertTrue(response.getRazorpayOrderId().startsWith("COD-"));
        assertFalse(response.getOrderIds().isEmpty());
    }

    @Test
    @DisplayName("5.2 Create Payment Order - Online Razorpay Order")
    void testCreatePaymentOrder_Razorpay() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest request = new CreateOrderRequest();
        request.setPaymentMethod(PaymentMethod.UPI);
        request.setShippingAddress("999 Digital Payment Ave, Hyderabad, 500081");
        request.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        PaymentOrderResponse response = paymentService.createPaymentOrder(customer.getId(), request);

        assertNotNull(response);
        assertNotNull(response.getRazorpayOrderId());
        assertNotNull(response.getKeyId());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    @DisplayName("5.3 Payment Verification - Success and Order Confirmation")
    void testVerifyAndProcessPayment_Success() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();
        int initialStock = product.getStockQuantity();

        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setPaymentMethod(PaymentMethod.CARD);
        orderReq.setShippingAddress("123 Verification Lane, Chennai, 600001");
        orderReq.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 2)));

        PaymentOrderResponse orderResp = paymentService.createPaymentOrder(customer.getId(), orderReq);

        PaymentVerificationRequest verifyReq = new PaymentVerificationRequest(
                orderResp.getRazorpayOrderId(),
                "pay_test_live_001",
                "simulated_signature"
        );

        Payment verifiedPayment = paymentService.verifyAndProcessPayment(verifyReq);

        assertNotNull(verifiedPayment);
        assertEquals(PaymentStatus.PAID, verifiedPayment.getStatus());
        assertEquals("pay_test_live_001", verifiedPayment.getRazorpayPaymentId());

        Product reloadedProduct = productRepository.findById(product.getId()).get();
        assertEquals(initialStock - 2, reloadedProduct.getStockQuantity());
    }

    @Test
    @DisplayName("5.4 Payment Verification - Invalid Signature Rejection")
    void testVerifyAndProcessPayment_InvalidSignature_Fails() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setPaymentMethod(PaymentMethod.NETBANKING);
        orderReq.setShippingAddress("Security St, Bangalore, 560001");
        orderReq.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        PaymentOrderResponse orderResp = paymentService.createPaymentOrder(customer.getId(), orderReq);

        // Intentionally invalid signature (not matching simulated_signature)
        PaymentVerificationRequest verifyReq = new PaymentVerificationRequest(
                orderResp.getRazorpayOrderId(),
                "pay_tampered_999",
                "totally_invalid_signature_xyz"
        );

        RuntimeException ex = assertThrows(RuntimeException.class, () -> paymentService.verifyAndProcessPayment(verifyReq));
        assertTrue(ex.getMessage().contains("Invalid Razorpay signature") || ex.getMessage().contains("verification failed"));

        Payment paymentRecord = paymentRepository.findByRazorpayOrderId(orderResp.getRazorpayOrderId()).get();
        assertEquals(PaymentStatus.FAILED, paymentRecord.getStatus());
    }

    @Test
    @DisplayName("5.5 Handle Payment Failure - Mark payment record as FAILED")
    void testHandlePaymentFailure() {
        User customer = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).findFirst().get();
        Product product = productRepository.findAll().stream().filter(p -> p.getStockQuantity() > 5).findFirst().get();

        CreateOrderRequest orderReq = new CreateOrderRequest();
        orderReq.setPaymentMethod(PaymentMethod.CARD);
        orderReq.setItems(List.of(new CreateOrderRequest.OrderItemRequest(product.getId(), 1)));

        PaymentOrderResponse orderResp = paymentService.createPaymentOrder(customer.getId(), orderReq);

        Payment failed = paymentService.handlePaymentFailure(orderResp.getRazorpayOrderId(), "Customer cancelled card authorization dialog.");
        assertEquals(PaymentStatus.FAILED, failed.getStatus());
        assertTrue(failed.getFailureReason().contains("Customer cancelled card authorization"));
    }
}
