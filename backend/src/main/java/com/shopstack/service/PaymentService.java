package com.shopstack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopstack.dto.CouponValidationResponse;
import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentVerificationRequest;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PaymentService {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final CommissionService commissionService;
    private final CouponService couponService;
    private final WarehouseService warehouseService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PaymentService(RazorpayService razorpayService,
                          PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          ProductRepository productRepository,
                          UserRepository userRepository,
                          VendorProfileRepository vendorProfileRepository,
                          CommissionService commissionService,
                          CouponService couponService,
                          WarehouseService warehouseService,
                          NotificationService notificationService) {
        this.razorpayService = razorpayService;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.commissionService = commissionService;
        this.couponService = couponService;
        this.warehouseService = warehouseService;
        this.notificationService = notificationService;
    }

    /**
     * Create payment order (Supports COD and Razorpay Online Checkout with Coupon Discounts).
     */
    @Transactional
    public PaymentOrderResponse createPaymentOrder(Long customerId, CreateOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer user not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Items list cannot be empty for checkout.");
        }

        PaymentMethod selectedMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CARD;

        // Validate stock, calculate total cart subtotal and group items by vendor
        Map<Long, List<CreateOrderRequest.OrderItemRequest>> itemsByVendor = new HashMap<>();
        double totalCartSubtotal = 0.0;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemReq.getProductId()));

            if (product.getStatus() == ProductStatus.OUT_OF_STOCK || product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
                throw new RuntimeException("Product '" + product.getTitle() + "' is Out of Stock!");
            }

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for '" + product.getTitle() + "'. Available stock: "
                        + product.getStockQuantity() + ", Requested quantity: " + itemReq.getQuantity());
            }

            double unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            totalCartSubtotal += (unitPrice * itemReq.getQuantity());

            Long vendorId = product.getVendorProfile().getId();
            itemsByVendor.computeIfAbsent(vendorId, k -> new ArrayList<>()).add(itemReq);
        }

        totalCartSubtotal = Math.round(totalCartSubtotal * 100.0) / 100.0;

        // Validate coupon if provided
        CouponValidationResponse couponValidation = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            couponValidation = couponService.validateCoupon(request.getCouponCode(), totalCartSubtotal, customerId);
            if (!couponValidation.isValid()) {
                throw new IllegalArgumentException(couponValidation.getMessage());
            }
        }

        double totalCouponDiscount = (couponValidation != null && couponValidation.isValid()) ? couponValidation.getDiscountAmount() : 0.0;
        String appliedCouponCode = (couponValidation != null && couponValidation.isValid()) ? couponValidation.getCouponCode() : null;

        String defaultAddress = "Veerapunayunipalli, Kadapa, Andhra Pradesh, 516321, India";
        String shippingAddress = (request.getShippingAddress() != null && !request.getShippingAddress().isBlank())
                ? request.getShippingAddress() : defaultAddress;

        List<Order> pendingOrders = new ArrayList<>();
        double grandTotalAmount = 0.0;
        List<Long> createdOrderIds = new ArrayList<>();

        for (Map.Entry<Long, List<CreateOrderRequest.OrderItemRequest>> entry : itemsByVendor.entrySet()) {
            Long vendorId = entry.getKey();
            List<CreateOrderRequest.OrderItemRequest> vendorItems = entry.getValue();

            VendorProfile vendor = vendorProfileRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

            String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            double vendorOrderSubtotal = 0.0;

            Order order = Order.builder()
                    .orderNumber(orderNumber)
                    .customer(customer)
                    .vendorProfile(vendor)
                    .status(OrderStatus.PENDING) // Initial state is PENDING
                    .shippingAddress(shippingAddress)
                    .totalAmount(0.0)
                    .build();

            order.setPaymentMethod(selectedMethod);
            order.setPaymentStatus(selectedMethod == PaymentMethod.COD ? PaymentStatus.PENDING_COD : PaymentStatus.PENDING);

            List<OrderItem> orderItems = new ArrayList<>();

            for (CreateOrderRequest.OrderItemRequest itemReq : vendorItems) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                double unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
                double itemSubtotal = unitPrice * itemReq.getQuantity();
                vendorOrderSubtotal += itemSubtotal;

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(itemSubtotal)
                        .build();

                orderItems.add(orderItem);
            }

            vendorOrderSubtotal = Math.round(vendorOrderSubtotal * 100.0) / 100.0;

            // Pro-rate discount for this vendor order
            double vendorDiscount = 0.0;
            if (totalCouponDiscount > 0 && totalCartSubtotal > 0) {
                vendorDiscount = Math.round((vendorOrderSubtotal / totalCartSubtotal) * totalCouponDiscount * 100.0) / 100.0;
            }

            double vendorFinalAmount = Math.max(0.0, Math.round((vendorOrderSubtotal - vendorDiscount) * 100.0) / 100.0);

            order.setSubtotalAmount(vendorOrderSubtotal);
            order.setDiscountAmount(vendorDiscount);
            order.setCouponCode(appliedCouponCode);
            order.setTotalAmount(vendorFinalAmount);
            order.setItems(orderItems);

            Order savedOrder = orderRepository.save(order);
            commissionService.createOrUpdateCommissionForOrder(savedOrder);
            pendingOrders.add(savedOrder);
            createdOrderIds.add(savedOrder.getId());

            grandTotalAmount += vendorFinalAmount;
        }

        grandTotalAmount = Math.max(0.0, Math.round(grandTotalAmount * 100.0) / 100.0);

        // Cash on Delivery Flow (No Razorpay call, stock NOT deducted yet)
        if (selectedMethod == PaymentMethod.COD) {
            String codOrderId = "COD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            try {
                String orderIdsJson = objectMapper.writeValueAsString(createdOrderIds);
                Payment payment = Payment.builder()
                        .razorpayOrderId(codOrderId)
                        .amount(grandTotalAmount)
                        .currency("INR")
                        .status(PaymentStatus.PENDING_COD)
                        .customer(customer)
                        .orderIdsJson(orderIdsJson)
                        .build();
                payment.setPaymentMethod(PaymentMethod.COD);

                paymentRepository.save(payment);

                // Record coupon usage for COD orders
                if (appliedCouponCode != null && totalCouponDiscount > 0) {
                    for (Order ord : pendingOrders) {
                        couponService.recordCouponUsage(appliedCouponCode, ord, customer, ord.getSubtotalAmount(), ord.getDiscountAmount(), ord.getTotalAmount());
                    }
                }

                // Automatic real-time notification trigger for COD Order Placed
                for (Order ord : pendingOrders) {
                    try {
                        notificationService.sendOrderPlacedNotification(ord);
                    } catch (Exception e) {
                        System.err.println("Failed to send COD order placed notification: " + e.getMessage());
                    }
                }
            } catch (Exception e) {
                throw new RuntimeException("Error saving COD payment state: " + e.getMessage());
            }

            PaymentOrderResponse response = new PaymentOrderResponse(
                    codOrderId,
                    "COD_MODE",
                    0L,
                    grandTotalAmount,
                    "INR",
                    "PENDING_COD",
                    createdOrderIds
            );
            response.setPaymentMethod("COD");
            return response;
        }

        // Online Payment Flow (Cards / UPI / Netbanking via Razorpay)
        String receiptId = "RCP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String razorpayOrderId = razorpayService.createRazorpayOrder(grandTotalAmount, receiptId);

        try {
            String orderIdsJson = objectMapper.writeValueAsString(createdOrderIds);
            Payment payment = Payment.builder()
                    .razorpayOrderId(razorpayOrderId)
                    .amount(grandTotalAmount)
                    .currency(razorpayService.getCurrency())
                    .status(PaymentStatus.PENDING)
                    .customer(customer)
                    .orderIdsJson(orderIdsJson)
                    .build();
            payment.setPaymentMethod(selectedMethod);

            paymentRepository.save(payment);
        } catch (Exception e) {
            throw new RuntimeException("Error saving payment order state: " + e.getMessage());
        }

        long amountInPaise = Math.round(grandTotalAmount * 100);

        PaymentOrderResponse response = new PaymentOrderResponse(
                razorpayOrderId,
                razorpayService.getKeyId(),
                amountInPaise,
                grandTotalAmount,
                razorpayService.getCurrency(),
                "PENDING",
                createdOrderIds
        );
        response.setPaymentMethod(selectedMethod.name());
        return response;
    }

    /**
     * Verify payment signature and update order & inventory state safely (IDEMPOTENT).
     */
    @Transactional
    public Payment verifyAndProcessPayment(PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found for Razorpay Order ID: " + request.getRazorpayOrderId()));

        // Idempotency check: If already paid, return without re-deducting stock or re-processing
        if (payment.getStatus() == PaymentStatus.PAID) {
            return payment;
        }

        // Verify Razorpay signature
        boolean isValidSignature = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValidSignature) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Razorpay payment signature verification failed.");
            Payment failedPayment = paymentRepository.save(payment);
            try {
                notificationService.sendPaymentFailedNotification(failedPayment, "Razorpay payment signature verification failed.");
            } catch (Exception e) {
                System.err.println("Failed to send payment failed notification: " + e.getMessage());
            }
            throw new RuntimeException("Payment verification failed! Invalid Razorpay signature.");
        }

        // Mark payment as PAID
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setStatus(PaymentStatus.PAID);
        Payment savedPayment = paymentRepository.save(payment);

        // Parse order IDs
        List<Long> orderIds = parseOrderIds(payment.getOrderIdsJson());
        List<Order> confirmedOrders = new ArrayList<>();

        // Update orders to CONFIRMED and deduct inventory stock EXACTLY ONCE
        for (Long orderId : orderIds) {
            Order order = orderRepository.findById(orderId).orElse(null);
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                order.setPaymentStatus(PaymentStatus.PAID);

                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    int newStock = Math.max(0, currentStock - item.getQuantity());

                    product.setStockQuantity(newStock);
                    if (newStock <= 0) {
                        product.setStatus(ProductStatus.OUT_OF_STOCK);
                    }
                    productRepository.save(product);
                }

                Order savedOrder = orderRepository.save(order);
                commissionService.createOrUpdateCommissionForOrder(savedOrder);
                confirmedOrders.add(savedOrder);

                try {
                    warehouseService.allocateOrder(savedOrder);
                } catch (Exception e) {
                    System.err.println("Warehouse auto-allocation notice on payment: " + e.getMessage());
                }

                // Record coupon usage on verified payment
                if (savedOrder.getCouponCode() != null && savedOrder.getDiscountAmount() != null && savedOrder.getDiscountAmount() > 0) {
                    couponService.recordCouponUsage(
                            savedOrder.getCouponCode(),
                            savedOrder,
                            savedOrder.getCustomer(),
                            savedOrder.getSubtotalAmount(),
                            savedOrder.getDiscountAmount(),
                            savedOrder.getTotalAmount()
                    );
                }

                // Automatic real-time notification trigger for Order Placed
                try {
                    notificationService.sendOrderPlacedNotification(savedOrder);
                } catch (Exception e) {
                    System.err.println("Failed to send order placed notification: " + e.getMessage());
                }
            }
        }

        // Automatic real-time notification trigger for Payment Successful
        try {
            notificationService.sendPaymentSuccessNotification(savedPayment, confirmedOrders);
        } catch (Exception e) {
            System.err.println("Failed to send payment success notification: " + e.getMessage());
        }

        return savedPayment;
    }

    @Transactional
    public Payment handlePaymentFailure(String razorpayOrderId, String reason) {
        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment record not found for order: " + razorpayOrderId));

        if (payment.getStatus() != PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(reason != null ? reason : "Payment cancelled or failed by customer.");
            Payment saved = paymentRepository.save(payment);

            // Automatic real-time notification trigger for Payment Failed
            try {
                notificationService.sendPaymentFailedNotification(saved, saved.getFailureReason());
            } catch (Exception e) {
                System.err.println("Failed to send payment failed notification: " + e.getMessage());
            }
            return saved;
        }
        return payment;
    }

    public List<Payment> getCustomerPayments(Long customerId) {
        return paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    private List<Long> parseOrderIds(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
