package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.notification.EmailNotificationService;
import com.shopstack.shopstack_backend.dto.request.OrderRequest;
import com.shopstack.shopstack_backend.dto.response.OrderItemResponse;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;
import com.shopstack.shopstack_backend.entity.Cart;
import com.shopstack.shopstack_backend.entity.CartItem;
import com.shopstack.shopstack_backend.entity.Coupon;
import com.shopstack.shopstack_backend.entity.InventoryHistory;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.OrderItem;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.Warehouse;
import com.shopstack.shopstack_backend.repository.CartRepository;
import com.shopstack.shopstack_backend.repository.CouponRepository;
import com.shopstack.shopstack_backend.repository.InventoryHistoryRepository;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.repository.WarehouseRepository;
import com.shopstack.shopstack_backend.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final CouponRepository couponRepository;
    private final WarehouseRepository warehouseRepository;
    private final EmailNotificationService emailNotificationService;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            UserRepository userRepository,
            InventoryHistoryRepository inventoryHistoryRepository,
            CouponRepository couponRepository,
            WarehouseRepository warehouseRepository,
            EmailNotificationService emailNotificationService) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.inventoryHistoryRepository =
                inventoryHistoryRepository;
        this.couponRepository = couponRepository;
        this.warehouseRepository = warehouseRepository;
        this.emailNotificationService = emailNotificationService;
    }

    // =========================
    // CREATE ORDER / CHECKOUT
    // =========================

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        User user = getAuthenticatedUser();

        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cart not found"
                        ));

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Cart is empty"
            );
        }

        // =========================
        // CHECK STOCK
        // =========================

        for (CartItem cartItem : cart.getItems()) {

            Product product = productRepository
                    .findById(
                            cartItem.getProduct().getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + cartItem.getProduct().getId()
                            ));

            Integer availableStock =
                    product.getStockQuantity();

            Integer requestedQuantity =
                    cartItem.getQuantity();

            if (requestedQuantity == null ||
                    requestedQuantity <= 0) {

                throw new RuntimeException(
                        "Invalid quantity for product: "
                                + product.getProductName()
                );
            }

            if (availableStock == null ||
                    availableStock <= 0) {

                throw new RuntimeException(
                        product.getProductName()
                                + " is Out of Stock"
                );
            }

            if (requestedQuantity > availableStock) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + product.getProductName()
                                + ". Available: "
                                + availableStock
                                + ", Requested: "
                                + requestedQuantity
                );
            }
        }

        // =========================
        // CREATE ORDER
        // =========================

        Order order = new Order();

        order.setCustomerEmail(user.getEmail());
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setCity(request.getCity());
        order.setState(request.getState());
        order.setPincode(request.getPincode());
        order.setStatus(OrderStatus.PLACED);

        double totalAmount = 0.0;

        // =========================
        // CREATE ORDER ITEMS
        // =========================

        for (CartItem cartItem : cart.getItems()) {

            Product product = productRepository
                    .findById(
                            cartItem.getProduct().getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            ));

            Integer quantity =
                    cartItem.getQuantity();

            BigDecimal finalPrice =
                    product.getFinalPrice();

            if (finalPrice == null) {

                throw new RuntimeException(
                        "Final price not available for "
                                + product.getProductName()
                );
            }

            BigDecimal subtotal =
                    finalPrice.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            OrderItem item = new OrderItem();

            item.setOrder(order);

            item.setProductId(
                    product.getId()
            );

            item.setProductName(
                    product.getProductName()
            );

            item.setPrice(
                    finalPrice.doubleValue()
            );

            item.setQuantity(quantity);

            item.setSubtotal(
                    subtotal.doubleValue()
            );

            order.getItems().add(item);

            totalAmount +=
                    subtotal.doubleValue();
        }

        // =========================
        // APPLY COUPON
        // =========================

        String couponCode = request.getCouponCode();

        if (couponCode != null &&
                !couponCode.trim().isEmpty()) {

            Coupon coupon =
                    couponRepository.findByCode(
                                    couponCode.trim().toUpperCase()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Invalid coupon code"
                                    ));

            LocalDateTime now =
                    LocalDateTime.now();

            // Check whether coupon is active
            if (!coupon.isActive()) {

                throw new RuntimeException(
                        "Coupon is inactive"
                );
            }

            // Check start date
            if (now.isBefore(
                    coupon.getStartDate())) {

                throw new RuntimeException(
                        "Coupon is not active yet"
                );
            }

            // Check expiry date
            if (now.isAfter(
                    coupon.getExpiryDate())) {

                throw new RuntimeException(
                        "Coupon has expired"
                );
            }

            // Check minimum order amount
            if (totalAmount <
                    coupon.getMinimumOrderAmount()) {

                throw new RuntimeException(
                        "Minimum order amount for coupon is ₹"
                                + coupon.getMinimumOrderAmount()
                );
            }

            // Check usage limit
            if (coupon.getUsedCount() >=
                    coupon.getUsageLimit()) {

                throw new RuntimeException(
                        "Coupon usage limit reached"
                );
            }

            // Calculate discount
            double discountAmount =
                    totalAmount *
                            coupon.getDiscountPercentage()
                            / 100.0;

            // Calculate final amount
            totalAmount =
                    totalAmount -
                            discountAmount;

            // Prevent negative total
            if (totalAmount < 0) {
                totalAmount = 0;
            }

            // Increase coupon usage
            coupon.setUsedCount(
                    coupon.getUsedCount() + 1
            );

            couponRepository.save(coupon);
        }

        // =========================
        // SET FINAL ORDER AMOUNT
        // =========================

        order.setTotalAmount(totalAmount);

        // =========================
        // SAVE ORDER
        // =========================

        Order savedOrder =
                orderRepository.save(order);

        // =========================
        // REDUCE STOCK
        // =========================

        for (CartItem cartItem : cart.getItems()) {

            Product product = productRepository
                    .findById(
                            cartItem.getProduct().getId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            ));

            Integer quantity =
                    cartItem.getQuantity();

            int stockBefore =
                    product.getStockQuantity();

            int newStock =
                    stockBefore - quantity;

            product.setStockQuantity(newStock);

            productRepository.save(product);

            // =========================
            // INVENTORY HISTORY
            // =========================

            InventoryHistory history =
                    new InventoryHistory();

            history.setProductId(
                    product.getId()
            );

            history.setProductName(
                    product.getProductName()
            );

            history.setStockBefore(
                    stockBefore
            );

            history.setQuantityChange(
                    -quantity
            );

            history.setStockAfter(
                    newStock
            );

            history.setAction(
                    "ORDER_PLACED"
            );

            history.setReferenceId(
                    savedOrder.getId()
            );

            inventoryHistoryRepository.save(
                    history
            );
        }

        // =========================
        // CLEAR CART
        // =========================

        cart.getItems().clear();

cartRepository.save(cart);

// Send Order Placed notification
StringBuilder emailBody = new StringBuilder();

emailBody.append("Hello ")
        .append(savedOrder.getCustomerName())
        .append(",\n\n");

emailBody.append("Your ShopStack order has been placed successfully.\n\n");

emailBody.append("Order ID: ")
        .append(savedOrder.getId())
        .append("\n");

emailBody.append("Order Date: ")
        .append(savedOrder.getCreatedAt())
        .append("\n");

emailBody.append("Status: ")
        .append(savedOrder.getStatus())
        .append("\n");

emailBody.append("Total Amount: ₹")
        .append(savedOrder.getTotalAmount())
        .append("\n\n");

emailBody.append("Products:\n");

savedOrder.getItems().forEach(item -> {
    emailBody.append("- ")
            .append(item.getProductName())
            .append(" | Quantity: ")
            .append(item.getQuantity())
            .append(" | Subtotal: ₹")
            .append(item.getSubtotal())
            .append("\n");
});

emailBody.append("\nThank you for shopping with ShopStack!\n");

emailNotificationService.sendEmail(
        savedOrder.getCustomerEmail(),
        "ShopStack - Order Placed Successfully",
        emailBody.toString()
);

return mapToResponse(savedOrder);
    }

    // =========================
    // GET MY ORDERS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {

        User user = getAuthenticatedUser();

        return orderRepository
                .findByCustomerEmailOrderByCreatedAtDesc(
                        user.getEmail()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        User user = getAuthenticatedUser();

        Order order = orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        if (!order.getCustomerEmail()
                .equals(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to access this order"
            );
        }

        return mapToResponse(order);
    }

    // =========================
    // CANCEL ORDER
    // =========================

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {

        User user = getAuthenticatedUser();

        Order order = orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        if (!order.getCustomerEmail()
                .equals(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to cancel this order"
            );
        }

        if (order.getStatus() != OrderStatus.PLACED &&
                order.getStatus() != OrderStatus.CONFIRMED) {

            throw new RuntimeException(
                    "Order cannot be cancelled in "
                            + order.getStatus()
            );
        }

        // =========================
        // RESTORE STOCK
        // =========================

        for (OrderItem item : order.getItems()) {

            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + item.getProductId()
                            ));

            Integer currentStock =
                    product.getStockQuantity();

            if (currentStock == null) {
                currentStock = 0;
            }

            int restoredStock =
                    currentStock + item.getQuantity();

            product.setStockQuantity(
                    restoredStock
            );

            productRepository.save(product);

            InventoryHistory history =
                    new InventoryHistory();

            history.setProductId(
                    product.getId()
            );

            history.setProductName(
                    product.getProductName()
            );

            history.setStockBefore(
                    currentStock
            );

            history.setQuantityChange(
                    item.getQuantity()
            );

            history.setStockAfter(
                    restoredStock
            );

            history.setAction(
                    "ORDER_CANCELLED"
            );

            history.setReferenceId(
                    order.getId()
            );

            inventoryHistoryRepository.save(
                    history
            );
        }

        order.setStatus(
                OrderStatus.CANCELLED
        );

        Order cancelledOrder =
                orderRepository.save(order);

        return mapToResponse(cancelledOrder);
    }

    // =========================
    // REQUEST RETURN
    // =========================

    @Override
    @Transactional
    public OrderResponse requestReturn(Long id) {

        User user = getAuthenticatedUser();

        Order order = orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        // Make sure order belongs to customer
        if (!order.getCustomerEmail()
                .equals(user.getEmail())) {

            throw new RuntimeException(
                    "You are not allowed to return this order"
            );
        }

        // Return is allowed only after delivery
        if (order.getStatus() != OrderStatus.DELIVERED) {

            throw new RuntimeException(
                    "Only delivered orders can be returned"
            );
        }

        // =========================
        // RESTORE STOCK
        // =========================

        for (OrderItem item : order.getItems()) {

            Product product = productRepository
                    .findById(item.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found: "
                                            + item.getProductId()
                            ));

            Integer currentStock =
                    product.getStockQuantity();

            if (currentStock == null) {
                currentStock = 0;
            }

            int restoredStock =
                    currentStock + item.getQuantity();

            product.setStockQuantity(
                    restoredStock
            );

            productRepository.save(product);

            // =========================
            // INVENTORY HISTORY
            // =========================

            InventoryHistory history =
                    new InventoryHistory();

            history.setProductId(
                    product.getId()
            );

            history.setProductName(
                    product.getProductName()
            );

            history.setStockBefore(
                    currentStock
            );

            history.setQuantityChange(
                    item.getQuantity()
            );

            history.setStockAfter(
                    restoredStock
            );

            history.setAction(
                    "ORDER_RETURNED"
            );

            history.setReferenceId(
                    order.getId()
            );

            inventoryHistoryRepository.save(
                    history
            );
        }

        // =========================
        // CHANGE ORDER STATUS
        // =========================

        order.setStatus(
                OrderStatus.RETURNED
        );

        Order returnedOrder =
                orderRepository.save(order);

        return mapToResponse(returnedOrder);
    }

    // =========================
    // UPDATE ORDER STATUS
    // =========================

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(
            Long id,
            OrderStatus newStatus) {

        Order order = orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        if (newStatus == null) {

            throw new RuntimeException(
                    "Order status is required"
            );
        }

        OrderStatus currentStatus =
                order.getStatus();

        boolean validTransition = false;

        // PLACED -> CONFIRMED
        if (currentStatus ==
                OrderStatus.PLACED &&
                newStatus ==
                        OrderStatus.CONFIRMED) {

            validTransition = true;
        }

        // CONFIRMED -> PROCESSING
        else if (currentStatus ==
                OrderStatus.CONFIRMED &&
                newStatus ==
                        OrderStatus.PROCESSING) {

            validTransition = true;
        }

        // PROCESSING -> SHIPPED
        else if (currentStatus ==
                OrderStatus.PROCESSING &&
                newStatus ==
                        OrderStatus.SHIPPED) {

            validTransition = true;
        }

        // SHIPPED -> DELIVERED
        else if (currentStatus ==
                OrderStatus.SHIPPED &&
                newStatus ==
                        OrderStatus.DELIVERED) {

            validTransition = true;
        }

        if (!validTransition) {

            throw new RuntimeException(
                    "Invalid order status transition: "
                            + currentStatus
                            + " -> "
                            + newStatus
            );
        }

        order.setStatus(newStatus);

        Order updatedOrder =
                orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    // =========================
    // ALLOCATE WAREHOUSE
    // =========================

    @Override
    @Transactional
    public OrderResponse allocateWarehouse(
            Long orderId,
            Long warehouseId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        Warehouse warehouse = warehouseRepository
                .findById(warehouseId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Warehouse not found"
                        ));

        if (!warehouse.isActive()) {

            throw new RuntimeException(
                    "Cannot allocate an inactive warehouse"
            );
        }

        if (order.getStatus() == OrderStatus.DELIVERED ||
                order.getStatus() == OrderStatus.CANCELLED ||
                order.getStatus() == OrderStatus.RETURNED ||
                order.getStatus() == OrderStatus.REFUNDED) {

            throw new RuntimeException(
                    "Warehouse cannot be allocated for order in "
                            + order.getStatus()
                            + " status"
            );
        }

        order.setWarehouse(warehouse);

        Order savedOrder =
                orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    // =========================
    // GET AUTHENTICATED USER
    // =========================

    private User getAuthenticatedUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    // =========================
    // MAP ORDER TO RESPONSE
    // =========================

    private OrderResponse mapToResponse(
            Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderItemResponse(
                                        item.getProductId(),
                                        item.getProductName(),
                                        item.getPrice(),
                                        item.getQuantity(),
                                        item.getSubtotal()
                                )
                        )
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomerEmail(),
                order.getCustomerName(),
                order.getPhone(),
                order.getAddress(),
                order.getCity(),
                order.getState(),
                order.getPincode(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                items
        );
    }
}