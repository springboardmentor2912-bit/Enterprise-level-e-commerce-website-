package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.OrderItem;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final CouponService couponService;

    public OrderService(
        OrderRepository orderRepository,
        ProductRepository productRepository,
        CouponService couponService) {

    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
    this.couponService = couponService;
}


    // =====================================================
    // CREATE ORDER
    // =====================================================

// =====================================================
// CREATE ORDER
// =====================================================

@Transactional
public Order createOrder(Order order) {

    order.setStatus("PENDING");

    order.setPaymentStatus("PENDING");

    order.setPaymentMethod("RAZORPAY");

    order.setOrderDate(LocalDateTime.now());


    // =================================================
    // CALCULATE SUBTOTAL
    // =================================================

    double subtotal = 0;


    if (order.getItems() != null) {

        for (OrderItem item : order.getItems()) {

            if (item.getProduct() == null ||
                    item.getProduct().getId() == null) {

                throw new RuntimeException(
                        "Product information is missing"
                );
            }


            Product product =
                    productRepository.findById(
                            item.getProduct().getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            )
                    );


            // Check stock

            if (product.getStockQuantity()
                    < item.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + product.getProductName()
                );
            }


            // Store actual product

            item.setProduct(product);


            // Store current product price

            item.setPrice(
                    product.getPrice().doubleValue()
            );


            // Store vendor ID

            if (product.getVendor() != null) {

                item.setVendorId(
                        product.getVendor().getId()
                );
            }


            // Connect item to order

            item.setOrder(order);


            // Calculate subtotal

            subtotal +=
                    item.getPrice()
                            * item.getQuantity();
        }
    }


    // =================================================
    // APPLY COUPON
    // =================================================

    double discount = 0;


    if (order.getCouponCode() != null &&
            !order.getCouponCode().isBlank()) {

        discount =
                couponService.calculateDiscount(
                        order.getCouponCode(),
                        subtotal
                );
    }


    // =================================================
    // STORE DISCOUNT INFORMATION
    // =================================================

    order.setDiscountAmount(discount);


    order.setTotalAmount(
            subtotal - discount
    );


    // =================================================
    // SAVE ORDER
    // =================================================

    return orderRepository.save(order);
}


    // =====================================================
    // GET CUSTOMER ORDERS
    // =====================================================

    public List<Order> getCustomerOrders(
            Long customerId) {

        return orderRepository
                .findByCustomerIdOrderByOrderDateDesc(
                        customerId
                );
    }


    // =====================================================
    // GET SINGLE ORDER
    // =====================================================

    public Order getOrder(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        )
                );
    }


    // =====================================================
    // PAYMENT SUCCESS
    // =====================================================

    @Transactional
    public Order markPaymentSuccessful(
            Long orderId,
            String paymentId,
            String razorpayOrderId) {

        Order order = getOrder(orderId);


        // -----------------------------------------------
        // Already completed
        // -----------------------------------------------

        if ("COMPLETED".equalsIgnoreCase(
                order.getPaymentStatus())) {

            return order;
        }


        // -----------------------------------------------
        // Validate items
        // -----------------------------------------------

        if (order.getItems() == null ||
                order.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Order contains no products"
            );
        }


        // -----------------------------------------------
        // Reduce inventory
        // -----------------------------------------------

        for (OrderItem item : order.getItems()) {

            if (item.getProduct() == null ||
                    item.getProduct().getId() == null) {

                throw new RuntimeException(
                        "Order item product is missing"
                );
            }


            Product product =
                    productRepository.findById(
                            item.getProduct().getId()
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            )
                    );


            int currentStock =
                    product.getStockQuantity();

            int quantity =
                    item.getQuantity();


            if (currentStock < quantity) {

                throw new RuntimeException(
                        "Insufficient stock for "
                                + product.getProductName()
                );
            }


            product.setStockQuantity(
                    currentStock - quantity
            );

            productRepository.save(product);
        }


        // -----------------------------------------------
        // FIX ORDER INFORMATION
        // -----------------------------------------------

        order.setPaymentStatus("COMPLETED");

        order.setPaymentMethod("RAZORPAY");

        order.setStatus("CONFIRMED");


        /*
         * Make sure an order date always exists.
         */

        if (order.getOrderDate() == null) {

            order.setOrderDate(
                    LocalDateTime.now()
            );
        }


        /*
         * Make sure total amount is available.
         *
         * The amount normally comes from Checkout.
         * We do not overwrite an existing valid amount.
         */

        if (order.getTotalAmount() <= 0) {

            double calculatedTotal = 0;

            for (OrderItem item : order.getItems()) {

                calculatedTotal +=
                        item.getPrice() *
                        item.getQuantity();
            }

            order.setTotalAmount(
                    calculatedTotal
            );
        }

            if (order.getCouponCode() != null &&
        !order.getCouponCode().isBlank()) {

    couponService.incrementUsage(
            order.getCouponCode()
    );
}



        return orderRepository.save(order);


        
    }



    // =====================================================
    // PAYMENT FAILED
    // =====================================================

    public Order markPaymentFailed(
            Long orderId) {

        Order order = getOrder(orderId);

        order.setPaymentStatus("FAILED");

        order.setStatus("PAYMENT_FAILED");

        return orderRepository.save(order);
    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    @Transactional
    public Order cancelOrder(
            Long id,
            Long customerId) {

        Order order = getOrder(id);


        if (!order.getCustomerId()
                .equals(customerId)) {

            throw new RuntimeException(
                    "You cannot cancel this order"
            );
        }


        if (
                order.getStatus().equals("SHIPPED") ||
                order.getStatus().equals("DELIVERED") ||
                order.getStatus().equals("CANCELLED") ||
                order.getStatus().equals("RETURNED") ||
                order.getStatus().equals("REFUNDED")
        ) {

            throw new RuntimeException(
                    "Order cannot be cancelled at this stage"
            );
        }


        if ("COMPLETED".equalsIgnoreCase(
                order.getPaymentStatus())) {

            for (OrderItem item :
                    order.getItems()) {

                Product product =
                        productRepository.findById(
                                item.getProduct().getId()
                        ).orElseThrow();

                product.setStockQuantity(
                        product.getStockQuantity()
                                + item.getQuantity()
                );

                productRepository.save(product);
            }
        }


        order.setStatus("CANCELLED");

        order.setCancelledAt(
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }


    // =====================================================
    // RETURN ORDER
    // =====================================================

    @Transactional
    public Order returnOrder(
            Long id,
            Long customerId) {

        Order order = getOrder(id);


        if (!order.getCustomerId()
                .equals(customerId)) {

            throw new RuntimeException(
                    "You cannot return this order"
            );
        }


        if (!order.getStatus()
                .equals("DELIVERED")) {

            throw new RuntimeException(
                    "Only delivered orders can be returned"
            );
        }


        for (OrderItem item :
                order.getItems()) {

            Product product =
                    productRepository.findById(
                            item.getProduct().getId()
                    ).orElseThrow();

            product.setStockQuantity(
                    product.getStockQuantity()
                            + item.getQuantity()
            );

            productRepository.save(product);
        }


        order.setStatus("RETURNED");

        order.setReturnedAt(
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }


    // =====================================================
    // REFUND ORDER
    // =====================================================

    public Order refundOrder(
            Long id,
            Long customerId) {

        Order order = getOrder(id);


        if (!order.getCustomerId()
                .equals(customerId)) {

            throw new RuntimeException(
                    "You cannot refund this order"
            );
        }


        if (!order.getStatus()
                .equals("RETURNED")) {

            throw new RuntimeException(
                    "Order must be returned before refund"
            );
        }


        order.setStatus("REFUNDED");

        order.setPaymentStatus("REFUNDED");

        order.setRefundedAt(
                LocalDateTime.now()
        );

        return orderRepository.save(order);
    }
}