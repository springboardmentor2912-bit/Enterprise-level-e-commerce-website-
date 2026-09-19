package com.shopstack.backend.service;

import com.shopstack.backend.dto.OrderItemResponse;
import com.shopstack.backend.dto.OrderRequest;
import com.shopstack.backend.dto.OrderResponse;
import com.shopstack.backend.entity.Cart;
import com.shopstack.backend.entity.CartItem;
import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.entity.CouponUsage;
import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.OrderItem;
import com.shopstack.backend.entity.OrderStatus;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.DiscountType;
import com.shopstack.backend.repository.CartRepository;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.CouponUsageRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private CommissionService commissionService;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(
            String email,
            OrderRequest request
    ) {

        // =====================================================
        // 1. FIND CUSTOMER
        // =====================================================

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        // =====================================================
        // 2. FIND CUSTOMER CART
        // =====================================================

        Cart cart =
                cartRepository.findByUser(user)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found"
                                )
                        );


        // =====================================================
        // 3. CHECK CART
        // =====================================================

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Cart is empty"
            );
        }


        // =====================================================
        // 4. CHECK STOCK
        // =====================================================

        for (CartItem cartItem :
                cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            if (product.getStock() <
                    cartItem.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }
        }


        // =====================================================
        // 5. CALCULATE SUBTOTAL
        // =====================================================

        double subtotal = 0;

        for (CartItem cartItem :
                cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            int quantity =
                    cartItem.getQuantity();

            double price =
                    product.getFinalPrice() != null
                            ? product.getFinalPrice()
                            : product.getPrice();

            subtotal +=
                    price * quantity;
        }


        // =====================================================
        // 6. COUPON VARIABLES
        // =====================================================

        Coupon appliedCoupon = null;

        double discountAmount = 0;


        // =====================================================
        // 7. GET COUPON CODE FROM REQUEST
        // =====================================================

        String couponCode = null;

        if (request != null) {

            couponCode =
                    request.getCouponCode();
        }


        // =====================================================
        // 8. APPLY COUPON
        // =====================================================

        if (couponCode != null &&
                !couponCode.trim().isEmpty()) {

            String code =
                    couponCode
                            .trim()
                            .toUpperCase();


            // -------------------------------------------------
            // FIND COUPON
            // -------------------------------------------------

            appliedCoupon =
                    couponRepository
                            .findByCode(code)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Invalid coupon code"
                                    )
                            );


            // =================================================
            // CHECK PRODUCT ELIGIBILITY
            // =================================================

            if (appliedCoupon.getEligibleProducts() == null ||
                    appliedCoupon.getEligibleProducts().isEmpty()) {

                throw new RuntimeException(
                        "This coupon is not valid for any products"
                );
            }


            final Coupon couponForEligibility =
                    appliedCoupon;


            boolean eligibleProductFound =
                    cart.getItems()
                            .stream()
                            .anyMatch(cartItem ->

                                    couponForEligibility
                                            .getEligibleProducts()
                                            .stream()
                                            .anyMatch(couponProduct ->

                                                    couponProduct
                                                            .getId()
                                                            .equals(
                                                                    cartItem
                                                                            .getProduct()
                                                                            .getId()
                                                            )
                                            )
                            );


            if (!eligibleProductFound) {

                throw new RuntimeException(
                        "This coupon is not applicable to the products in your cart"
                );
            }


            // =================================================
            // CURRENT TIME
            // =================================================

            LocalDateTime now =
                    LocalDateTime.now(
                            ZoneId.of("Asia/Kolkata")
                    );


            // =================================================
            // CHECK ACTIVE
            // =================================================

            if (!Boolean.TRUE.equals(
                    appliedCoupon.getActive())) {

                throw new RuntimeException(
                        "Coupon is inactive"
                );
            }


            // =================================================
            // CHECK START DATE
            // =================================================

            if (appliedCoupon.getStartDate() != null &&
                    now.isBefore(
                            appliedCoupon.getStartDate()
                    )) {

                throw new RuntimeException(
                        "Coupon is not active yet"
                );
            }


            // =================================================
            // CHECK EXPIRY
            // =================================================

            if (appliedCoupon.getExpiryDate() != null &&
                    now.isAfter(
                            appliedCoupon.getExpiryDate()
                    )) {

                throw new RuntimeException(
                        "Coupon has expired"
                );
            }


            // =================================================
            // CHECK USAGE LIMIT
            // =================================================

            if (appliedCoupon.getUsageLimit() != null &&
                    appliedCoupon.getUsedCount() != null &&
                    appliedCoupon.getUsedCount() >=
                            appliedCoupon.getUsageLimit()) {

                throw new RuntimeException(
                        "Coupon usage limit reached"
                );
            }


            // =================================================
            // CHECK MINIMUM ORDER
            // =================================================

            if (appliedCoupon
                    .getMinimumOrderAmount() != null &&
                    subtotal <
                            appliedCoupon
                                    .getMinimumOrderAmount()) {

                throw new RuntimeException(
                        "Minimum order amount is ₹"
                                + appliedCoupon
                                .getMinimumOrderAmount()
                );
            }


            // =================================================
            // CALCULATE DISCOUNT
            // =================================================

            if (appliedCoupon.getDiscountType()
                    == DiscountType.PERCENTAGE) {

                discountAmount =
                        subtotal *
                                appliedCoupon
                                        .getDiscountValue()
                                / 100.0;

            } else {

                discountAmount =
                        appliedCoupon
                                .getDiscountValue();
            }


            // =================================================
            // MAXIMUM DISCOUNT
            // =================================================

            if (appliedCoupon
                    .getMaximumDiscount() != null &&
                    discountAmount >
                            appliedCoupon
                                    .getMaximumDiscount()) {

                discountAmount =
                        appliedCoupon
                                .getMaximumDiscount();
            }


            // =================================================
            // DISCOUNT CANNOT EXCEED SUBTOTAL
            // =================================================

            if (discountAmount > subtotal) {

                discountAmount =
                        subtotal;
            }


            // =================================================
            // ROUND DISCOUNT
            // =================================================

            discountAmount =
                    Math.round(
                            discountAmount * 100.0
                    ) / 100.0;
        }


        // =====================================================
        // 9. CALCULATE FINAL AMOUNT
        // =====================================================

        double finalAmount =
                subtotal - discountAmount;


        finalAmount =
                Math.round(
                        finalAmount * 100.0
                ) / 100.0;


        // =====================================================
        // 10. CREATE ORDER
        // =====================================================

        Order order =
                new Order();


        order.setUser(user);


        order.setStatus(
                OrderStatus.PLACED
        );


        order.setOrderDate(
                LocalDateTime.now(
                        ZoneId.of("Asia/Kolkata")
                )
        );


        // -----------------------------------------------------
        // STORE FINAL PAYABLE AMOUNT
        // -----------------------------------------------------

        order.setTotalAmount(
                finalAmount
        );


        // -----------------------------------------------------
        // STORE PAYMENT DETAILS
        // -----------------------------------------------------

        if (request != null) {

            order.setPaymentMethod(
                    request.getPaymentMethod()
            );

            order.setPaymentStatus(
                    request.getPaymentStatus()
            );

            order.setRazorpayPaymentId(
                    request.getRazorpayPaymentId()
            );

            order.setRazorpayOrderId(
                    request.getRazorpayOrderId()
            );
        }


        // =====================================================
        // 11. CREATE ORDER ITEMS
        // =====================================================

        List<OrderItem> orderItems =
                new ArrayList<>();


        for (CartItem cartItem :
                cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            int quantity =
                    cartItem.getQuantity();


            double price =
                    product.getFinalPrice() != null
                            ? product.getFinalPrice()
                            : product.getPrice();


            OrderItem orderItem =
                    new OrderItem();


            orderItem.setOrder(
                    order
            );


            orderItem.setProduct(
                    product
            );


            orderItem.setQuantity(
                    quantity
            );


            // -------------------------------------------------
            // STORE PURCHASE-TIME PRICE
            // -------------------------------------------------

            orderItem.setPrice(
                    price
            );


            orderItems.add(
                    orderItem
            );


            // -------------------------------------------------
            // REDUCE STOCK
            // -------------------------------------------------

            product.setStock(
                    product.getStock()
                            - quantity
            );
        }


        order.setItems(
                orderItems
        );


        // =====================================================
        // 12. SAVE ORDER
        // =====================================================

        Order savedOrder =
                orderRepository.save(order);


        // =====================================================
        // DEBUG PAYMENT STATUS
        // =====================================================

        System.out.println(
                "PAYMENT STATUS = [" +
                        savedOrder.getPaymentStatus() +
                        "]"
        );


        // =====================================================
        // 13. SAVE COUPON USAGE
        // =====================================================

        if (appliedCoupon != null) {

            // -------------------------------------------------
            // INCREASE USAGE COUNT
            // -------------------------------------------------

            Integer currentUsedCount =
                    appliedCoupon.getUsedCount();


            if (currentUsedCount == null) {
                currentUsedCount = 0;
            }


            appliedCoupon.setUsedCount(
                    currentUsedCount + 1
            );


            couponRepository.save(
                    appliedCoupon
            );


            // -------------------------------------------------
            // CREATE USAGE RECORD
            // -------------------------------------------------

            CouponUsage couponUsage =
                    new CouponUsage();


            couponUsage.setCoupon(
                    appliedCoupon
            );


            couponUsage.setCustomer(
                    user
            );


            couponUsage.setOrder(
                    savedOrder
            );


            couponUsage.setDiscountAmount(
                    discountAmount
            );


            couponUsage.setUsedAt(
                    LocalDateTime.now(
                            ZoneId.of("Asia/Kolkata")
                    )
            );


            couponUsageRepository.save(
                    couponUsage
            );
        }


        // =====================================================
        // 14. CUSTOMER ORDER PLACED EMAIL
        // =====================================================

        notificationService.notifyCustomerOrderPlaced(
                savedOrder
        );


        // =====================================================
        // 15. CUSTOMER PAYMENT SUCCESS EMAIL
        // =====================================================

        if ("PAID".equalsIgnoreCase(
                savedOrder.getPaymentStatus()
        )) {

            System.out.println(
                    "TRIGGERING PAYMENT SUCCESS EMAIL"
            );


            notificationService.notifyCustomerPaymentSuccess(
                    savedOrder
            );
        }


        // =====================================================
        // 16. NOTIFY VENDORS
        // =====================================================

        notificationService.notifyVendors(
                savedOrder
        );


        // =====================================================
        // 17. CLEAR CART
        // =====================================================

        cart.getItems().clear();


        cartRepository.save(
                cart
        );


        // =====================================================
        // 18. RETURN RESPONSE
        // =====================================================

        return convertToResponse(
                savedOrder
        );
    }


    // =========================================================
    // PLACE ORDER WITHOUT REQUEST
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(
            String email
    ) {

        return placeOrder(
                email,
                null
        );
    }


    // =========================================================
    // CONVERT ORDER TO RESPONSE
    // =========================================================

    private OrderResponse convertToResponse(
            Order order
    ) {

        OrderResponse response =
                new OrderResponse();


        response.setId(
                order.getId()
        );


        response.setTotalAmount(
                order.getTotalAmount()
        );


        response.setStatus(
                order.getStatus().name()
        );


        response.setOrderDate(
                order.getOrderDate()
        );


        List<OrderItemResponse> itemResponses =
                new ArrayList<>();


        for (OrderItem item :
                order.getItems()) {

            OrderItemResponse itemResponse =
                    new OrderItemResponse();


            itemResponse.setId(
                    item.getId()
            );


            itemResponse.setProductId(
                    item.getProduct().getId()
            );


            itemResponse.setProductName(
                    item.getProduct().getName()
            );


            itemResponse.setImageUrl(
                    item.getProduct().getImageUrl()
            );


            itemResponse.setQuantity(
                    item.getQuantity()
            );


            itemResponse.setPrice(
                    item.getPrice()
            );


            itemResponse.setSubtotal(
                    item.getPrice()
                            * item.getQuantity()
            );


            itemResponses.add(
                    itemResponse
            );
        }


        response.setItems(
                itemResponses
        );


        return response;
    }


    // =========================================================
    // GET CUSTOMER ORDERS
    // =========================================================

    public List<OrderResponse> getMyOrders(
            String email
    ) {

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        List<Order> orders =
                orderRepository
                        .findByUserOrderByOrderDateDesc(
                                user
                        );


        List<OrderResponse> responses =
                new ArrayList<>();


        for (Order order :
                orders) {

            responses.add(
                    convertToResponse(order)
            );
        }


        return responses;
    }


    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @Transactional
    public String updateOrderStatus(
            Long orderId,
            String email,
            OrderStatus newStatus
    ) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        Order order =
                orderRepository.findById(orderId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Order not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK VENDOR OWNERSHIP
        // -----------------------------------------------------

        boolean vendorOwnsOrder =
                order.getItems()
                        .stream()
                        .anyMatch(item -> {

                            Product product =
                                    item.getProduct();

                            if (product.getVendor() == null) {
                                return false;
                            }

                            return product
                                    .getVendor()
                                    .getId()
                                    .equals(
                                            vendor.getId()
                                    );
                        });


        if (!vendorOwnsOrder) {

            throw new RuntimeException(
                    "Access denied. You are not the vendor for this order."
            );
        }


        // -----------------------------------------------------
        // CURRENT STATUS
        // -----------------------------------------------------

        OrderStatus currentStatus =
                order.getStatus();


        // -----------------------------------------------------
        // TERMINAL STATES
        // -----------------------------------------------------

        if (currentStatus ==
                OrderStatus.DELIVERED) {

            throw new RuntimeException(
                    "Delivered order cannot be updated"
            );
        }


        if (currentStatus ==
                OrderStatus.CANCELLED) {

            throw new RuntimeException(
                    "Cancelled order cannot be updated"
            );
        }


        // -----------------------------------------------------
        // VALIDATE TRANSITION
        // -----------------------------------------------------

        if (!isValidTransition(
                currentStatus,
                newStatus
        )) {

            throw new RuntimeException(
                    "Invalid status transition from "
                            + currentStatus
                            + " to "
                            + newStatus
            );
        }


        // -----------------------------------------------------
        // CANCEL
        // -----------------------------------------------------

        if (newStatus ==
                OrderStatus.CANCELLED) {

            warehouseService.releaseAllocation(
                    order.getId()
            );
        }


        // -----------------------------------------------------
        // UPDATE STATUS
        // -----------------------------------------------------

        order.setStatus(
                newStatus
        );


        // -----------------------------------------------------
        // CONFIRMED
        // -----------------------------------------------------

        if (newStatus ==
                OrderStatus.CONFIRMED) {

            /*
             * Allocation is part of confirmation.
             * If no active warehouse can satisfy
             * the complete order, the transaction fails
             * and the order remains in PLACED state.
             */

            orderRepository.save(
                    order
            );


            warehouseService.allocateOrder(
                    order.getId()
            );


            commissionService.calculateCommission(
                    order.getId()
            );
        }


        // -----------------------------------------------------
        // DELIVERED
        // -----------------------------------------------------

        if (newStatus ==
                OrderStatus.DELIVERED) {

            order.setDeliveredAt(
                    LocalDateTime.now(
                            ZoneId.of("Asia/Kolkata")
                    )
            );
        }

        Order savedOrder =
                orderRepository.save(
                        order
                );

// =====================================================
// CUSTOMER - ORDER SHIPPED EMAIL
// =====================================================

        if (newStatus ==
                OrderStatus.SHIPPED) {

            notificationService.notifyCustomerOrderShipped(
                    savedOrder
            );
        }

        if (newStatus ==
                OrderStatus.DELIVERED) {

            notificationService.notifyCustomerOrderDelivered(
                    savedOrder
            );
        }

        return "Order status updated to "
                + newStatus;
    }


    // =========================================================
    // VALID STATUS TRANSITIONS
    // =========================================================

    private boolean isValidTransition(
            OrderStatus current,
            OrderStatus next
    ) {

        return switch (current) {

            case PLACED ->
                    next == OrderStatus.CONFIRMED
                            || next == OrderStatus.CANCELLED;

            case CONFIRMED ->
                    next == OrderStatus.PROCESSING
                            || next == OrderStatus.CANCELLED;

            case PROCESSING ->
                    next == OrderStatus.SHIPPED;

            case SHIPPED ->
                    next == OrderStatus.OUT_FOR_DELIVERY;

            case OUT_FOR_DELIVERY ->
                    next == OrderStatus.DELIVERED;

            case DELIVERED,
                 CANCELLED,
                 RETURNED,
                 REFUNDED ->
                    false;
        };
    }


    // =========================================================
    // GET VENDOR ORDERS
    // =========================================================

    public List<OrderResponse> getVendorOrders(
            String email
    ) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        List<Order> allOrders =
                orderRepository.findAll();


        List<OrderResponse> responses =
                new ArrayList<>();


        for (Order order :
                allOrders) {

            boolean vendorOwnsOrder =
                    order.getItems()
                            .stream()
                            .anyMatch(item -> {

                                Product product =
                                        item.getProduct();

                                if (product.getVendor() == null) {
                                    return false;
                                }

                                return product
                                        .getVendor()
                                        .getId()
                                        .equals(
                                                vendor.getId()
                                        );
                            });


            if (vendorOwnsOrder) {

                responses.add(
                        convertToResponse(
                                order
                        )
                );
            }
        }


        return responses;
    }


}