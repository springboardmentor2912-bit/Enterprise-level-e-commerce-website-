package com.shopstack.service;

import com.shopstack.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EmailTemplateServiceTest {

    private EmailTemplateService emailTemplateService;
    private User testUser;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        emailTemplateService = new EmailTemplateService();

        testUser = User.builder()
                .id(1L)
                .fullName("Alex Morgan")
                .email("alex.morgan@example.com")
                .role(Role.CUSTOMER)
                .build();

        Product product1 = Product.builder()
                .id(10L)
                .title("Sony WH-1000XM5 Noise Canceling Headphones")
                .price(29999.0)
                .build();

        OrderItem item1 = OrderItem.builder()
                .id(101L)
                .product(product1)
                .quantity(2)
                .unitPrice(29999.0)
                .subtotal(59998.0)
                .build();

        testOrder = Order.builder()
                .id(501L)
                .orderNumber("ORD-98765432")
                .customer(testUser)
                .totalAmount(59998.0)
                .subtotalAmount(59998.0)
                .discountAmount(0.0)
                .status(OrderStatus.CONFIRMED)
                .shippingAddress("456 Market St, San Francisco, CA")
                .items(List.of(item1))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("1. Build Order Placed Email Content")
    void testBuildOrderPlacedEmail() {
        EmailTemplateService.EmailContent content = emailTemplateService.buildOrderPlacedEmail(testOrder);

        assertNotNull(content);
        assertTrue(content.getSubject().contains("ORD-98765432"));
        assertTrue(content.getBodyHtml().contains("ORD-98765432"));
        assertTrue(content.getBodyHtml().contains("Sony WH-1000XM5"));
        assertTrue(content.getBodyHtml().contains("59998.00"));
        assertTrue(content.getBodyHtml().contains("Alex Morgan"));
        assertTrue(content.getBodyHtml().contains("456 Market St"));

        assertTrue(content.getBodyText().contains("ORD-98765432"));
        assertTrue(content.getBodyText().contains("Sony WH-1000XM5"));
    }

    @Test
    @DisplayName("2. Build Payment Successful Email Content")
    void testBuildPaymentSuccessEmail() {
        Payment payment = Payment.builder()
                .id(201L)
                .razorpayOrderId("order_rzp_12345")
                .razorpayPaymentId("pay_rzp_999888")
                .amount(59998.0)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CARD)
                .customer(testUser)
                .build();

        EmailTemplateService.EmailContent content = emailTemplateService.buildPaymentSuccessEmail(payment, List.of(testOrder));

        assertNotNull(content);
        assertTrue(content.getSubject().contains("pay_rzp_999888"));
        assertTrue(content.getBodyHtml().contains("pay_rzp_999888"));
        assertTrue(content.getBodyHtml().contains("59998.00"));
        assertTrue(content.getBodyHtml().contains("ORD-98765432"));
        assertTrue(content.getBodyText().contains("SUCCESS / PAID"));
    }

    @Test
    @DisplayName("3. Build Payment Failed Email Content")
    void testBuildPaymentFailedEmail() {
        Payment payment = Payment.builder()
                .id(202L)
                .razorpayOrderId("order_rzp_failed_123")
                .amount(14999.0)
                .currency("INR")
                .status(PaymentStatus.FAILED)
                .customer(testUser)
                .failureReason("Insufficient funds in customer card")
                .build();

        EmailTemplateService.EmailContent content = emailTemplateService.buildPaymentFailedEmail(payment, "Insufficient funds in customer card");

        assertNotNull(content);
        assertTrue(content.getSubject().contains("order_rzp_failed_123"));
        assertTrue(content.getBodyHtml().contains("Payment Attempt Failed"));
        assertTrue(content.getBodyHtml().contains("Insufficient funds"));
        assertTrue(content.getBodyHtml().contains("14999.00"));
        assertTrue(content.getBodyText().contains("FAILED"));
    }

    @Test
    @DisplayName("4. Build Order Shipped Email Content")
    void testBuildOrderShippedEmail() {
        EmailTemplateService.EmailContent content = emailTemplateService.buildOrderShippedEmail(testOrder, "FedEx Priority", "TRK-FDX-884920");

        assertNotNull(content);
        assertTrue(content.getSubject().contains("ORD-98765432"));
        assertTrue(content.getSubject().contains("TRK-FDX-884920"));
        assertTrue(content.getBodyHtml().contains("FedEx Priority"));
        assertTrue(content.getBodyHtml().contains("TRK-FDX-884920"));
        assertTrue(content.getBodyHtml().contains("SHIPPED"));
        assertTrue(content.getBodyText().contains("FedEx Priority"));
    }

    @Test
    @DisplayName("5. Build Order Delivered Email Content")
    void testBuildOrderDeliveredEmail() {
        EmailTemplateService.EmailContent content = emailTemplateService.buildOrderDeliveredEmail(testOrder);

        assertNotNull(content);
        assertTrue(content.getSubject().contains("ORD-98765432"));
        assertTrue(content.getBodyHtml().contains("Order Delivered Successfully"));
        assertTrue(content.getBodyHtml().contains("DELIVERED"));
        assertTrue(content.getBodyText().contains("DELIVERED"));
    }

    @Test
    @DisplayName("6. Build Refund Completed Email Content")
    void testBuildRefundCompletedEmail() {
        EmailTemplateService.EmailContent content = emailTemplateService.buildRefundCompletedEmail(testOrder, 59998.0, "QC Verified intact - restocked to warehouse Aisle 2.");

        assertNotNull(content);
        assertTrue(content.getSubject().contains("59998.00"));
        assertTrue(content.getSubject().contains("ORD-98765432"));
        assertTrue(content.getBodyHtml().contains("REFUND COMPLETED"));
        assertTrue(content.getBodyHtml().contains("QC Verified intact"));
        assertTrue(content.getBodyText().contains("REFUNDED"));
    }
}
