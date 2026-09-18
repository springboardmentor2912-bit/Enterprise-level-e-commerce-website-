package com.shopstack;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import com.shopstack.service.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class EndToEndMarketplaceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CouponService couponService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private OrderWarehouseAllocationRepository allocationRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Test
    @DisplayName("End-to-End Workflow: Registration → Cart → Payment → Fulfillment → Delivery → Return → QC & Restock → Refund")
    void testCompleteECommerceEndToEndWorkflow() {
        // =========================================================================
        // STEP 1: Customer Registration & Authentication
        // =========================================================================
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("E2E Test Customer");
        registerReq.setEmail("e2e.customer@shopstack.com");
        registerReq.setPassword("SecurePass@2026");
        registerReq.setPhoneNumber("+91 9876543210");
        registerReq.setRole(Role.CUSTOMER);

        AuthResponse authResp = authService.register(registerReq);
        assertNotNull(authResp.getAccessToken());
        Long customerId = authResp.getId();

        // =========================================================================
        // STEP 2: Browse Products & Stock Verification
        // =========================================================================
        List<Product> catalog = productService.getAllActiveProducts();
        assertFalse(catalog.isEmpty(), "Catalog must contain active products");

        Product testProduct = catalog.stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() >= 10)
                .findFirst()
                .orElse(catalog.get(0));

        int initialCatalogStock = testProduct.getStockQuantity();
        assertTrue(initialCatalogStock >= 2, "Test product must have at least 2 units in stock");

        // =========================================================================
        // STEP 3: Validate Promotional Coupon (FLAT100 or SAVE10)
        // =========================================================================
        double orderSubtotal = (testProduct.getDiscountPrice() != null ? testProduct.getDiscountPrice() : testProduct.getPrice()) * 2;
        CouponValidationResponse couponResp = couponService.validateCoupon("WELCOME50", orderSubtotal, customerId);
        assertNotNull(couponResp);
        assertTrue(couponResp.isValid(), "WELCOME50 coupon should be valid for cart amount: " + orderSubtotal);
        assertTrue(couponResp.getDiscountAmount() > 0);

        // =========================================================================
        // STEP 4: Checkout & Payment Order Creation (Razorpay Online Checkout)
        // =========================================================================
        CreateOrderRequest checkoutReq = new CreateOrderRequest();
        checkoutReq.setPaymentMethod(PaymentMethod.CARD);
        checkoutReq.setShippingAddress("Plot 42, Cyber Gateway, Hitec City, Hyderabad, 500081, India");
        checkoutReq.setCouponCode("WELCOME50");
        checkoutReq.setItems(List.of(new CreateOrderRequest.OrderItemRequest(testProduct.getId(), 2)));

        PaymentOrderResponse payOrderResp = paymentService.createPaymentOrder(customerId, checkoutReq);
        assertNotNull(payOrderResp);
        assertNotNull(payOrderResp.getRazorpayOrderId());
        assertEquals("PENDING", payOrderResp.getStatus());
        assertFalse(payOrderResp.getOrderIds().isEmpty());

        Long orderId = payOrderResp.getOrderIds().get(0);
        Order order = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.PENDING, order.getStatus());

        // =========================================================================
        // STEP 5: Payment Gateway Verification
        // =========================================================================
        PaymentVerificationRequest verifyReq = new PaymentVerificationRequest(
                payOrderResp.getRazorpayOrderId(),
                "pay_rzp_e2e_1111",
                "simulated_signature"
        );

        Payment verifiedPayment = paymentService.verifyAndProcessPayment(verifyReq);
        assertEquals(PaymentStatus.PAID, verifiedPayment.getStatus());

        Order confirmedOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.CONFIRMED, confirmedOrder.getStatus());
        assertEquals(PaymentStatus.PAID, confirmedOrder.getPaymentStatus());

        // Verify stock deducted from catalog
        Product productAfterOrder = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialCatalogStock - 2, productAfterOrder.getStockQuantity());

        // =========================================================================
        // STEP 6: Warehouse Allocation Verification
        // =========================================================================
        List<OrderWarehouseAllocation> allocations = allocationRepository.findByOrderId(orderId);
        assertFalse(allocations.isEmpty(), "Order must have warehouse allocations generated");

        OrderWarehouseAllocation alloc = allocations.get(0);
        assertEquals(StockMovementStage.ALLOCATED, alloc.getStage());
        assertNotNull(alloc.getWarehouse());
        assertNotNull(alloc.getAisleLocation());

        // =========================================================================
        // STEP 7: Warehouse Fulfillment: Pick Operation
        // =========================================================================
        PickRequest pickReq = new PickRequest();
        pickReq.setPickerName("Suresh Kumar - Hub Lead");
        pickReq.setNotes("Scanned barcode and verified item packaging intact.");

        OrderWarehouseAllocationDTO pickedAlloc = warehouseService.pickOrderItem(alloc.getId(), pickReq);
        assertEquals(StockMovementStage.PICKED, pickedAlloc.getStage());
        assertEquals("Suresh Kumar - Hub Lead", pickedAlloc.getPickerName());

        Order processingOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.PROCESSING, processingOrder.getStatus());

        // =========================================================================
        // STEP 8: Warehouse Fulfillment: Pack Operation
        // =========================================================================
        PackRequest packReq = new PackRequest();
        packReq.setPackerName("Priya Sharma - Packaging Specialist");
        packReq.setBoxType("Heavy Duty Corrugated B3");
        packReq.setBoxDimension("30x25x20 cm");
        packReq.setPackageWeightKg(1.25);
        packReq.setNotes("Sealed with tamper-evident security tape.");

        OrderWarehouseAllocationDTO packedAlloc = warehouseService.packOrderItem(alloc.getId(), packReq);
        assertEquals(StockMovementStage.PACKED, packedAlloc.getStage());
        assertNotNull(packedAlloc.getPackingSlipNumber());

        // =========================================================================
        // STEP 9: Warehouse Fulfillment: Ready for Shipment
        // =========================================================================
        ShipmentPreparationRequest prepReq = new ShipmentPreparationRequest();
        prepReq.setCarrier("BlueDart Express Logistics");
        prepReq.setTrackingNumber("TRK-BLD-998877");
        prepReq.setNotes("Consignment manifest created and handed to dock staging area.");

        OrderWarehouseAllocationDTO prepAlloc = warehouseService.prepareShipment(alloc.getId(), prepReq);
        assertEquals(StockMovementStage.READY_FOR_SHIPMENT, prepAlloc.getStage());
        assertEquals("TRK-BLD-998877", prepAlloc.getTrackingNumber());

        // =========================================================================
        // STEP 10: Carrier Dispatch (SHIPPED)
        // =========================================================================
        OrderWarehouseAllocationDTO dispatchedAlloc = warehouseService.dispatchShipment(alloc.getId());
        assertEquals(StockMovementStage.SHIPPED, dispatchedAlloc.getStage());

        Order shippedOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.SHIPPED, shippedOrder.getStatus());

        // =========================================================================
        // STEP 11: Final Delivery Confirmation (DELIVERED)
        // =========================================================================
        OrderWarehouseAllocationDTO deliveredAlloc = warehouseService.deliverShipment(alloc.getId());
        assertEquals(StockMovementStage.DELIVERED, deliveredAlloc.getStage());

        Order deliveredOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.DELIVERED, deliveredOrder.getStatus());

        // =========================================================================
        // STEP 12: Customer Return Request
        // =========================================================================
        ReturnRequestDto returnReq = new ReturnRequestDto();
        returnReq.setOrderId(orderId);
        returnReq.setOrderItemId(alloc.getOrderItem().getId());
        returnReq.setReason("Minor cosmetic scratch on outer casing");
        returnReq.setReturnReasonType("DEFECTIVE");
        returnReq.setCustomerComments("Requesting return and refund.");

        ReturnResponseDto returnResponse = warehouseService.requestReturn(customerId, returnReq);
        assertNotNull(returnResponse);
        assertEquals("PENDING_REVIEW", returnResponse.getStatus());
        Long returnId = returnResponse.getId();

        Order returnReqOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.RETURN_REQUESTED, returnReqOrder.getStatus());

        // =========================================================================
        // STEP 13: Admin Return Review & Approval
        // =========================================================================
        User admin = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).findFirst().get();
        ReturnReviewDto reviewDto = new ReturnReviewDto();
        reviewDto.setApproved(true);
        reviewDto.setAdminNotes("Authorized return. Pickup scheduled via reverse logistics.");
        reviewDto.setTargetWarehouseId(alloc.getWarehouse().getId());

        ReturnResponseDto approvedReturn = warehouseService.reviewReturn(returnId, reviewDto, admin.getId());
        assertEquals("APPROVED", approvedReturn.getStatus());

        Order returnApprovedOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.RETURN_APPROVED, returnApprovedOrder.getStatus());

        // =========================================================================
        // STEP 14: Warehouse Return Receipt
        // =========================================================================
        ReturnResponseDto receivedReturn = warehouseService.receiveReturnAtWarehouse(returnId, "Ravi Shankar - Inbound QC Lead");
        assertEquals("RECEIVED_AT_WAREHOUSE", receivedReturn.getStatus());

        Order returnedOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.RETURNED, returnedOrder.getStatus());

        // =========================================================================
        // STEP 15: QC Inspection: PASS & RESTOCK → Automatic Refund
        // =========================================================================
        QcInspectionDto qcDto = new QcInspectionDto();
        qcDto.setQcDecision("PASS");
        qcDto.setQcNotes("Product thoroughly tested, zero internal faults, repackaged in clean box.");
        qcDto.setInspectedBy("Ravi Shankar - Lead QC Engineer");

        ReturnResponseDto qcResult = warehouseService.performQcInspection(returnId, qcDto, admin.getId());
        assertEquals("QC_PASSED_RESTOCKED", qcResult.getStatus());
        assertEquals("PASS", qcResult.getQcDecision());

        // Verify Order & Payment marked REFUNDED
        Order refundedOrder = orderRepository.findById(orderId).orElseThrow();
        assertEquals(OrderStatus.REFUNDED, refundedOrder.getStatus());
        assertEquals(PaymentStatus.REFUNDED, refundedOrder.getPaymentStatus());

        // Verify Product catalog stock was replenished
        Product productAfterQc = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(initialCatalogStock, productAfterQc.getStockQuantity(), "Product stock must be restocked upon QC Pass");

        // Verify Stock Movement Audit Trail contains complete lifecycle records
        List<StockMovement> auditTrail = stockMovementRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
        assertFalse(auditTrail.isEmpty(), "Audit trail must record every stock movement stage");
        assertTrue(auditTrail.stream().anyMatch(m -> m.getMovementType() == StockMovementType.ORDER_ALLOCATION));
        assertTrue(auditTrail.stream().anyMatch(m -> m.getMovementType() == StockMovementType.PICK_CONFIRMED));
        assertTrue(auditTrail.stream().anyMatch(m -> m.getMovementType() == StockMovementType.PACK_VERIFIED));
        assertTrue(auditTrail.stream().anyMatch(m -> m.getMovementType() == StockMovementType.QC_RESTOCKED));
    }
}
