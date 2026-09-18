package com.javaenterprise.order.service;

import com.javaenterprise.cart.entity.Cart;
import com.javaenterprise.cart.repository.CartRepository;
import com.javaenterprise.coupon.dto.CouponValidationResponse;
import com.javaenterprise.coupon.service.CouponService;
import com.javaenterprise.customer.entity.Address;
import com.javaenterprise.customer.repository.AddressRepository;
import com.javaenterprise.order.dto.OrderItemResponse;
import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.entity.FulfillmentStatus;
import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.entity.WarehouseInventory;
import com.javaenterprise.warehouse.repository.WarehouseInventoryRepository;
import com.javaenterprise.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AddressRepository addressRepository;
    private final CouponService couponService;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final WarehouseRepository warehouseRepository;

    // 🆕 COMPLETE METHOD - Fetches all orders for admin
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        List<Order> orders = orderRepository.findByUser(user);

        // Debug log to verify items are loaded
        orders.forEach(order ->
                System.out.println("Order #" + order.getId() + " has " + order.getItems().size() + " items")
        );

        return orders.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // 🆕 COMPLETE METHOD - Fetches single order
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    @Transactional
    public void cancelOrder(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
        orderRepository.save(order);
    }

    @Transactional
    public OrderResponse checkout(Authentication authentication, Long addressId, String couponCode) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Cart> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Address shippingAddress = addressRepository.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new RuntimeException("Shipping address not found"));

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .shippingAddress(shippingAddress)
                .build();

        BigDecimal orderTotal = BigDecimal.ZERO;

        for (Cart cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int requiredQty = cartItem.getQuantity();

            if (product.getStock() < requiredQty) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - requiredQty);
            productRepository.save(product);

            BigDecimal originalPrice = product.getPrice();
            BigDecimal finalPrice = originalPrice;
            if (product.getDiscountPercentage() != null && product.getDiscountPercentage() > 0) {
                BigDecimal discountAmount = originalPrice
                        .multiply(BigDecimal.valueOf(product.getDiscountPercentage()))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                finalPrice = originalPrice.subtract(discountAmount);
            }

            BigDecimal itemSubtotal = finalPrice.multiply(BigDecimal.valueOf(requiredQty));
            orderTotal = orderTotal.add(itemSubtotal);

            BigDecimal commissionRate = BigDecimal.valueOf(10.00);
            BigDecimal commissionAmount = itemSubtotal
                    .multiply(commissionRate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            BigDecimal vendorEarning = itemSubtotal.subtract(commissionAmount);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(requiredQty)
                    .price(finalPrice)
                    .subtotal(itemSubtotal)
                    .commissionAmount(commissionAmount)
                    .vendorEarning(vendorEarning)
                    .warehouse(null)
                    .fulfillmentStatus(FulfillmentStatus.PENDING)
                    .build();

            order.getItems().add(orderItem);
        }

        BigDecimal discount = BigDecimal.ZERO;
        String appliedCode = null;

        if (couponCode != null && !couponCode.isBlank()) {
            CouponValidationResponse validation = couponService.validate(couponCode, orderTotal);
            if (!validation.isValid()) {
                throw new RuntimeException(validation.getMessage());
            }
            discount = validation.getDiscountAmount();
            appliedCode = validation.getCode();
        }

        order.setCouponCode(appliedCode);
        order.setDiscountAmount(discount);
        order.setTotalAmount(orderTotal.subtract(discount));

        Order savedOrder = orderRepository.save(order);
        cartRepository.deleteAll(cartItems);

        if (appliedCode != null) {
            couponService.trackUsage(appliedCode, user, savedOrder, discount);
        }

        return mapToResponse(savedOrder);
    }

    @Transactional
    public void allocateOrderToWarehouse(Long orderId, Long warehouseId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be allocated to a warehouse.");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        for (OrderItem item : order.getItems()) {
            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId)
                    .orElseThrow(() -> new RuntimeException("Product not found in the selected warehouse"));

            int availableStock = inventory.getTotalStock() - inventory.getAllocatedStock();
            if (availableStock < item.getQuantity()) {
                throw new RuntimeException("Insufficient available stock in the selected warehouse for: " + item.getProduct().getName());
            }

            item.setWarehouse(warehouse);
            item.setFulfillmentStatus(FulfillmentStatus.ALLOCATED);

            inventory.setAllocatedStock(inventory.getAllocatedStock() + item.getQuantity());
            warehouseInventoryRepository.save(inventory);
        }

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }

    @Transactional
    public void requestReturn(Long id, String reason, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Order order = orderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Returns can only be requested for delivered orders");
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnReason(reason);
        orderRepository.save(order);
    }

    // 🆕 COMPLETE MAPPING METHOD
    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productName(item.getProduct().getName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .subtotal(item.getSubtotal())
                                .fulfillmentStatus(item.getFulfillmentStatus() != null ? item.getFulfillmentStatus().name() : null)
                                .build())
                        .toList())
                .shippingAddress(order.getShippingAddress() != null
                        ? toAddressResponse(order.getShippingAddress())
                        : null)
                .build();
    }

    private com.javaenterprise.customer.dto.AddressResponse toAddressResponse(Address address) {
        return com.javaenterprise.customer.dto.AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine(address.getAddressLine())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .defaultAddress(address.isDefaultAddress())
                .build();
    }
}