package com.infosys.auth.service;

import com.infosys.auth.model.CartItem;
import com.infosys.auth.model.Order;
import com.infosys.auth.model.OrderItem;
import com.infosys.auth.model.Product;
import com.infosys.auth.repository.CartItemRepository;
import com.infosys.auth.repository.OrderRepository;
import com.infosys.auth.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomerService {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CommissionService commissionService;
    private final CouponService couponService;
    private final WarehouseService warehouseService;

    public CustomerService(CartItemRepository cartItemRepository,
                           OrderRepository orderRepository,
                           ProductRepository productRepository,
                           CommissionService commissionService,
                           CouponService couponService,
                           WarehouseService warehouseService) {
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.commissionService = commissionService;
        this.couponService = couponService;
        this.warehouseService = warehouseService;
    }

    public List<CartItem> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStockQuantity() == null || product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product '" + product.getName() + "' is out of stock");
        }

        int requestedQty = quantity != null ? quantity : 1;

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newTotal = item.getQuantity() + requestedQty;
            if (newTotal > product.getStockQuantity()) {
                throw new RuntimeException("Cannot add more than available stock (" + product.getStockQuantity() + " units) for '" + product.getName() + "'");
            }
            item.setQuantity(newTotal);
            return cartItemRepository.save(item);
        } else {
            if (requestedQty > product.getStockQuantity()) {
                throw new RuntimeException("Requested quantity exceeds available stock (" + product.getStockQuantity() + " units) for '" + product.getName() + "'");
            }
            CartItem newItem = new CartItem(userId, product, requestedQty);
            return cartItemRepository.save(newItem);
        }
    }

    public CartItem updateCartQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    @Transactional
    public Order checkout(Long userId, String customerName, String shippingAddress) {
        return checkout(userId, customerName, shippingAddress, null);
    }

    @Transactional
    public Order checkout(Long userId, String customerName, String shippingAddress, String couponCode) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot checkout: Cart is empty");
        }

        BigDecimal total = BigDecimal.ZERO;
        Order order = new Order(userId, customerName, BigDecimal.ZERO, shippingAddress);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            BigDecimal discountedPrice = product.getDiscountedPrice();
            BigDecimal itemTotal = discountedPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = new OrderItem(
                    product.getId(),
                    product.getName(),
                    product.getImageUrl(),
                    discountedPrice,
                    cartItem.getQuantity(),
                    product.getVendorId()
            );
            order.getItems().add(orderItem);

            // Deduct stock quantity – abort checkout if stock is insufficient
            if (product.getStockQuantity() == null || product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for '" + product.getName() + "'. Available: "
                        + (product.getStockQuantity() != null ? product.getStockQuantity() : 0)
                        + ", requested: " + cartItem.getQuantity());
            }
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);
        }

        BigDecimal subtotal = total;
        BigDecimal finalTotal = subtotal;

        order.setSubtotalAmount(subtotal);
        order.setDiscountAmount(BigDecimal.ZERO);

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Map<String, Object> couponCalc = couponService.validateAndCalculateDiscount(couponCode, subtotal);
            BigDecimal discountAmount = (BigDecimal) couponCalc.get("discountAmount");
            finalTotal = (BigDecimal) couponCalc.get("finalAmount");

            order.setCouponCode(couponCode.trim().toUpperCase());
            order.setDiscountAmount(discountAmount);
        }

        order.setTotalAmount(finalTotal);
        Order savedOrder = orderRepository.save(order);

        // Clear user cart
        cartItemRepository.deleteAll(cartItems);

        // Auto allocate warehouse
        try {
            savedOrder = warehouseService.allocateOrderToWarehouse(savedOrder);
        } catch (Exception e) {
            System.err.println("Error auto allocating warehouse in direct checkout: " + e.getMessage());
        }

        // Generate vendor commission records
        try {
            commissionService.createCommissionsForOrder(savedOrder);
        } catch (Exception e) {
            System.err.println("Error creating vendor commission for checkout order #" + savedOrder.getId() + ": " + e.getMessage());
        }

        // Record coupon usage tracking
        if (savedOrder.getCouponCode() != null && !savedOrder.getCouponCode().trim().isEmpty()) {
            try {
                couponService.recordCouponUsage(
                        savedOrder.getCouponCode(),
                        savedOrder.getUserId(),
                        savedOrder.getCustomerName(),
                        savedOrder.getId(),
                        savedOrder.getSubtotalAmount() != null ? savedOrder.getSubtotalAmount() : savedOrder.getTotalAmount(),
                        savedOrder.getDiscountAmount() != null ? savedOrder.getDiscountAmount() : BigDecimal.ZERO,
                        savedOrder.getTotalAmount()
                );
            } catch (Exception e) {
                System.err.println("Error recording coupon usage for checkout order #" + savedOrder.getId() + ": " + e.getMessage());
            }
        }

        return savedOrder;
    }

    @Transactional
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Cannot cancel another user's order");
        }

        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel order that has already been shipped or delivered. Please request a return instead.");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);

        // Restore product stock
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findById(item.getProductId()).ifPresent(p -> {
                    p.setStockQuantity((p.getStockQuantity() != null ? p.getStockQuantity() : 0) + item.getQuantity());
                    productRepository.save(p);
                });
            }
        }

        // Release warehouse reservation
        warehouseService.deallocateCancelledOrder(order);

        return orderRepository.save(order);
    }

    public List<Order> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
