package com.shopstack.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.shopstack.dto.ApplyCouponResponse;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.PaymentOrderResponse;
import com.shopstack.dto.PaymentStatusResponse;
import com.shopstack.dto.VerifyPaymentRequest;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    @Value("${razorpay.key.id:rzp_test_placeholder}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:placeholder_secret}")
    private String razorpayKeySecret;

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final WarehouseService warehouseService;
    private final NotificationService notificationService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              CustomerRepository customerRepository,
                              CartItemRepository cartItemRepository,
                              OrderRepository orderRepository,
                              ProductRepository productRepository,
                              InventoryHistoryRepository inventoryHistoryRepository,
                              CouponService couponService,
                              CouponRepository couponRepository,
                              CouponUsageRepository couponUsageRepository,
                              WarehouseService warehouseService,
                              NotificationService notificationService) {
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
        this.couponService = couponService;
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.warehouseService = warehouseService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(String customerEmail) {
        return createPaymentOrder(customerEmail, null);
    }

    @Override
    @Transactional
    public PaymentOrderResponse createPaymentOrder(String customerEmail, String couponCode) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customer.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot create payment order with an empty shopping cart.");
        }

        // Validate stock and calculate total amount on backend
        BigDecimal grossTotal = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", requested: " + cartItem.getQuantity());
            }

            BigDecimal effectivePrice = product.getFinalPrice() != null ? product.getFinalPrice() : product.getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            grossTotal = grossTotal.add(itemTotal);
        }

        // Validate coupon on backend if couponCode provided
        BigDecimal netTotal = grossTotal;
        if (couponCode != null && !couponCode.isBlank()) {
            ApplyCouponResponse couponRes = couponService.validateAndCalculateDiscount(couponCode, grossTotal, customerEmail);
            if (!couponRes.isValid()) {
                throw new RuntimeException("Coupon validation failed: " + couponRes.getMessage());
            }
            netTotal = couponRes.getNetTotal();
            if (netTotal.compareTo(BigDecimal.ZERO) < 0) {
                netTotal = BigDecimal.ZERO;
            }
        }

        // Convert amount to paise (1 INR = 100 paise)
        long amountInPaise = netTotal.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValue();

        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeyId.contains("placeholder") ||
            razorpayKeySecret == null || razorpayKeySecret.isBlank() || razorpayKeySecret.contains("placeholder")) {
            throw new RuntimeException("Razorpay credentials are not configured! Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in application.properties or environment variables.");
        }

        String razorpayOrderId;
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order rzpOrder = razorpayClient.orders.create(orderRequest);
            razorpayOrderId = rzpOrder.get("id");
            if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
                throw new RuntimeException("Razorpay API returned an empty order ID.");
            }
        } catch (RazorpayException e) {
            logger.error("Razorpay API Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("Razorpay API Error: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Failed to create Razorpay Order: {}", e.getMessage(), e);
            throw new RuntimeException("Razorpay Order Creation Error: " + e.getMessage(), e);
        }

        // Create Payment record in PENDING state
        Payment payment = new Payment();
        payment.setCustomer(customer);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(netTotal);
        payment.setCurrency("INR");
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return new PaymentOrderResponse(razorpayKeyId, razorpayOrderId, amountInPaise, netTotal, "INR");
    }

    @Override
    @Transactional
    public OrderDTO verifyAndPlaceOrder(String customerEmail, VerifyPaymentRequest request) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpay_order_id())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setCustomer(customer);
                    p.setRazorpayOrderId(request.getRazorpay_order_id());
                    p.setAmount(BigDecimal.ZERO);
                    p.setCurrency("INR");
                    p.setStatus(PaymentStatus.PENDING);
                    return paymentRepository.save(p);
                });

        // Idempotency check: if payment was already verified and order placed, return existing order
        if (PaymentStatus.PAID.equals(payment.getStatus()) && payment.getOrder() != null) {
            logger.info("Payment {} already verified. Returning existing order {}.",
                    request.getRazorpay_order_id(), payment.getOrder().getId());
            return new OrderDTO(payment.getOrder());
        }

        // 1. Strict Razorpay Signature Verification via SDK
        boolean isValid = verifySignature(
                request.getRazorpay_order_id(),
                request.getRazorpay_payment_id(),
                request.getRazorpay_signature()
        );

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRazorpayPaymentId(request.getRazorpay_payment_id());
            payment.setRazorpaySignature(request.getRazorpay_signature());
            paymentRepository.save(payment);
            logger.error("Signature verification failed for order_id={} payment_id={}",
                    request.getRazorpay_order_id(), request.getRazorpay_payment_id());

            notificationService.sendPaymentFailedEmail(customer, request.getRazorpay_order_id(), payment.getAmount(), "Invalid Razorpay payment signature.");

            throw new RuntimeException("Payment verification failed! Invalid Razorpay signature.");
        }

        // 2. Fetch cart items
        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customer.getId());
        if (cartItems.isEmpty()) {
            logger.warn("Cart empty for customer {} during verify for razorpay order {}.",
                    customerEmail, request.getRazorpay_order_id());
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            notificationService.sendPaymentFailedEmail(customer, request.getRazorpay_order_id(), payment.getAmount(), "Shopping cart is empty.");

            throw new RuntimeException("Your cart is empty. If you already placed an order successfully, " +
                    "please check your Orders page. Otherwise, add items to cart and retry.");
        }

        // 3. Re-check stock for all cart items
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);

                notificationService.sendPaymentFailedEmail(customer, request.getRazorpay_order_id(), payment.getAmount(), "Insufficient stock for product: " + product.getName());

                throw new RuntimeException("Insufficient stock for product: " + product.getName() +
                        ". Available: " + product.getStockQuantity() + ", required: " + cartItem.getQuantity());
            }
        }

        // 4. Update Payment to PAID
        payment.setStatus(PaymentStatus.PAID);
        payment.setRazorpayPaymentId(request.getRazorpay_payment_id());
        payment.setRazorpaySignature(request.getRazorpay_signature());

        // 5. Create ShopStack Order (status = CONFIRMED)
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress() != null && !request.getShippingAddress().isBlank()
                ? request.getShippingAddress()
                : (customer.getAddress() != null ? customer.getAddress() : "Default Address"));
        order.setStatus(OrderStatus.CONFIRMED);

        BigDecimal grossTotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            // Deduct inventory stock
            int newStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Record inventory history
            InventoryHistory history = new InventoryHistory(
                    product,
                    -cartItem.getQuantity(),
                    newStock,
                    "ORDER_CHECKOUT_RAZORPAY"
            );
            inventoryHistoryRepository.save(history);

            // Use effective price (finalPrice if present, otherwise price)
            BigDecimal effectivePrice = product.getFinalPrice() != null ? product.getFinalPrice() : product.getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            grossTotal = grossTotal.add(itemTotal);

            // Commission Calculation
            Vendor vendor = product.getVendor();
            BigDecimal commRate = (vendor != null && vendor.getCommissionRate() != null)
                    ? vendor.getCommissionRate()
                    : new BigDecimal("10.00");
            BigDecimal commAmount = itemTotal.multiply(commRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal vendorEarn = itemTotal.subtract(commAmount);

            OrderItem orderItem = new OrderItem(order, product, vendor, cartItem.getQuantity(), effectivePrice, commRate, commAmount, vendorEarn);
            orderItems.add(orderItem);
        }

        order.setGrossAmount(grossTotal);

        // Coupon application if couponCode passed
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            ApplyCouponResponse couponRes = couponService.validateAndCalculateDiscount(request.getCouponCode(), grossTotal, customerEmail);
            if (couponRes.isValid()) {
                discountAmount = couponRes.getDiscountAmount();
                order.setCouponCode(couponRes.getCode());
                order.setDiscountAmount(discountAmount);
            }
        }

        BigDecimal netTotal = grossTotal.subtract(discountAmount);
        if (netTotal.compareTo(BigDecimal.ZERO) < 0) netTotal = BigDecimal.ZERO;

        order.setTotalAmount(netTotal);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        // NOTE: Warehouse allocation is NOT done automatically.
        // Confirmed orders will appear in the Admin Warehouse Portal for manual or admin-triggered allocation.

        // Record Coupon Usage
        if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);

                CouponUsage usage = new CouponUsage(coupon, customer, savedOrder, order.getDiscountAmount());
                couponUsageRepository.save(usage);
            });
        }

        // 6. Link Payment to Order
        payment.setOrder(savedOrder);
        payment.setAmount(netTotal);
        paymentRepository.save(payment);

        // 7. Clear Cart
        cartItemRepository.deleteByCustomerId(customer.getId());

        // 8. Trigger Notifications (PAYMENT_SUCCESS & ORDER_PLACED)
        notificationService.sendPaymentSuccessEmail(savedOrder, payment);
        notificationService.sendOrderPlacedEmail(savedOrder);

        logger.info("Payment verified and order {} created for customer {}", savedOrder.getId(), customerEmail);
        return new OrderDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatusByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for Order ID: " + orderId));

        return new PaymentStatusResponse(
                order.getId(),
                order.getStatus(),
                payment.getStatus(),
                payment.getRazorpayOrderId(),
                payment.getRazorpayPaymentId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public void recordPaymentCancellation(String customerEmail, String razorpayOrderId) {
        if (razorpayOrderId == null || razorpayOrderId.isBlank()) return;

        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
        });
    }

    private boolean verifySignature(String razorpayOrderId, String razorpayPaymentId, String signature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || signature == null) {
            return false;
        }

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", signature);
            return com.razorpay.Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (RazorpayException e) {
            logger.error("Razorpay Utils signature verification failed: {}", e.getMessage(), e);
            return false;
        } catch (Exception e) {
            logger.error("Error during Razorpay signature verification: {}", e.getMessage(), e);
            return false;
        }
    }
}
