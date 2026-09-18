package com.shopstack.service;

import com.shopstack.dto.CouponValidationResponse;
import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.model.*;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.PaymentRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final PaymentRepository paymentRepository;
    private final CommissionService commissionService;
    private final CouponService couponService;
    private final WarehouseService warehouseService;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        UserRepository userRepository,
                        VendorProfileRepository vendorProfileRepository,
                        PaymentRepository paymentRepository,
                        CommissionService commissionService,
                        CouponService couponService,
                        WarehouseService warehouseService,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.paymentRepository = paymentRepository;
        this.commissionService = commissionService;
        this.couponService = couponService;
        this.warehouseService = warehouseService;
        this.notificationService = notificationService;
    }

    @Transactional
    public List<Order> createOrders(Long customerId, CreateOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Items list cannot be empty.");
        }

        PaymentMethod selectedMethod = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CARD;

        // Group order items by vendor and calculate overall total
        Map<Long, List<CreateOrderRequest.OrderItemRequest>> itemsByVendor = new HashMap<>();
        double totalCartSubtotal = 0.0;

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with ID: " + itemReq.getProductId()));

            // Stock Check
            if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
                throw new RuntimeException("Product '" + product.getTitle() + "' is Out of Stock!");
            }

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for '" + product.getTitle() + "'. Available: "
                        + product.getStockQuantity() + ", Requested: " + itemReq.getQuantity());
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

        List<Order> createdOrders = new ArrayList<>();

        for (Map.Entry<Long, List<CreateOrderRequest.OrderItemRequest>> entry : itemsByVendor.entrySet()) {
            Long vendorId = entry.getKey();
            List<CreateOrderRequest.OrderItemRequest> vendorItems = entry.getValue();

            VendorProfile vendor = vendorProfileRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor profile not found"));

            String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            double vendorSubtotal = 0.0;
            List<OrderItem> orderItems = new ArrayList<>();

            OrderStatus initialOrderStatus = selectedMethod == PaymentMethod.COD ? OrderStatus.PENDING : OrderStatus.CONFIRMED;

            Order order = Order.builder()
                    .orderNumber(orderNumber)
                    .customer(customer)
                    .vendorProfile(vendor)
                    .status(initialOrderStatus)
                    .shippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "Veerapunayunipalli, Kadapa, Andhra Pradesh, 516321, India")
                    .totalAmount(0.0)
                    .build();

            order.setPaymentMethod(selectedMethod);
            order.setPaymentStatus(selectedMethod == PaymentMethod.COD ? PaymentStatus.PENDING_COD : PaymentStatus.PAID);

            for (CreateOrderRequest.OrderItemRequest itemReq : vendorItems) {
                Product product = productRepository.findById(itemReq.getProductId()).get();
                double unitPrice = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
                double itemSubtotal = unitPrice * itemReq.getQuantity();
                vendorSubtotal += itemSubtotal;

                // For direct order creation, deduct stock only if confirmed immediately (online payment)
                if (initialOrderStatus == OrderStatus.CONFIRMED) {
                    int newStock = Math.max(0, product.getStockQuantity() - itemReq.getQuantity());
                    product.setStockQuantity(newStock);
                    if (newStock <= 0) {
                        product.setStatus(ProductStatus.OUT_OF_STOCK);
                    }
                    productRepository.save(product);
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(itemReq.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(itemSubtotal)
                        .build();

                orderItems.add(orderItem);
            }

            vendorSubtotal = Math.round(vendorSubtotal * 100.0) / 100.0;

            // Pro-rate discount for this vendor order
            double vendorDiscount = 0.0;
            if (totalCouponDiscount > 0 && totalCartSubtotal > 0) {
                vendorDiscount = Math.round((vendorSubtotal / totalCartSubtotal) * totalCouponDiscount * 100.0) / 100.0;
            }

            double vendorFinalAmount = Math.max(0.0, Math.round((vendorSubtotal - vendorDiscount) * 100.0) / 100.0);

            order.setSubtotalAmount(vendorSubtotal);
            order.setDiscountAmount(vendorDiscount);
            order.setCouponCode(appliedCouponCode);
            order.setTotalAmount(vendorFinalAmount);
            order.setItems(orderItems);

            Order savedOrder = orderRepository.save(order);
            commissionService.createOrUpdateCommissionForOrder(savedOrder);

            // Trigger Warehouse Stock Allocation if order is immediately confirmed
            if (initialOrderStatus == OrderStatus.CONFIRMED) {
                try {
                    warehouseService.allocateOrder(savedOrder);
                } catch (Exception e) {
                    System.err.println("Warehouse auto-allocation notice: " + e.getMessage());
                }
            }

            // Record coupon usage if applied
            if (appliedCouponCode != null && vendorDiscount > 0) {
                couponService.recordCouponUsage(appliedCouponCode, savedOrder, customer, vendorSubtotal, vendorDiscount, vendorFinalAmount);
            }

            // Real-time automatic notification trigger for Order Placed
            try {
                notificationService.sendOrderPlacedNotification(savedOrder);
            } catch (Exception e) {
                System.err.println("Failed to send order placed notification: " + e.getMessage());
            }

            createdOrders.add(savedOrder);
        }

        return createdOrders;
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Order> getOrdersByVendor(Long vendorId) {
        return orderRepository.findByVendorProfileIdOrderByCreatedAtDesc(vendorId);
    }

    public boolean isOrderOwnedByVendor(Long orderId, Long vendorId) {
        return orderRepository.existsByIdAndVendorProfileId(orderId, vendorId);
    }

    /**
     * Update Order Status (Handles stock deduction on confirmation and stock release on cancellation).
     */
    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        OrderStatus previousStatus = order.getStatus();

        if (previousStatus == newStatus) {
            return order;
        }

        // 1. Stock deduction check for COD / Pending order confirmation (PENDING -> CONFIRMED)
        if (previousStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) {
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
        } 
        // 2. Order Cancellation Stock Restoration & Warehouse Deallocation
        else if (newStatus == OrderStatus.CANCELLED) {
            order.setStatus(OrderStatus.CANCELLED);
            if (order.getPaymentStatus() == PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.REFUNDED);
            } else {
                order.setPaymentStatus(PaymentStatus.CANCELLED);
            }

            // Restore catalog stock if stock was previously deducted (i.e. confirmed/processing/shipped)
            if (previousStatus != OrderStatus.PENDING) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    int currentStock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                    product.setStockQuantity(currentStock + item.getQuantity());
                    if (product.getStatus() == ProductStatus.OUT_OF_STOCK && product.getStockQuantity() > 0) {
                        product.setStatus(ProductStatus.ACTIVE);
                    }
                    productRepository.save(product);
                }
            }

            // Release warehouse allocations
            try {
                warehouseService.cancelOrderAllocations(order);
            } catch (Exception e) {
                System.err.println("Warehouse cancellation notice: " + e.getMessage());
            }
        } 
        // 3. Normal status progression
        else {
            order.setStatus(newStatus);
            if (newStatus == OrderStatus.DELIVERED) {
                order.setPaymentStatus(PaymentStatus.PAID);
            }
        }

        Order saved = orderRepository.save(order);
        commissionService.createOrUpdateCommissionForOrder(saved);

        if (previousStatus == OrderStatus.PENDING && newStatus == OrderStatus.CONFIRMED) {
            try {
                warehouseService.allocateOrder(saved);
            } catch (Exception e) {
                System.err.println("Warehouse auto-allocation notice: " + e.getMessage());
            }
        }

        // Real-time automatic notification triggers based on order lifecycle
        try {
            if (newStatus == OrderStatus.SHIPPED) {
                notificationService.sendOrderShippedNotification(saved, "BlueDart Express / ShopStack Logistics", "TRK-ORD-" + saved.getId() + "890");
            } else if (newStatus == OrderStatus.DELIVERED) {
                notificationService.sendOrderDeliveredNotification(saved);
            } else if (newStatus == OrderStatus.REFUNDED) {
                notificationService.sendRefundCompletedNotification(saved, saved.getTotalAmount(), "Order refunded successfully.");
            } else if (newStatus == OrderStatus.CANCELLED && saved.getPaymentStatus() == PaymentStatus.REFUNDED) {
                notificationService.sendRefundCompletedNotification(saved, saved.getTotalAmount(), "Order cancelled and refund processed.");
            }
        } catch (Exception e) {
            System.err.println("Failed to trigger order status notification: " + e.getMessage());
        }

        return saved;
    }
}
