package com.shopstack.service;

import com.shopstack.dto.ApplyCouponResponse;
import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.OrderItemDTO;
import com.shopstack.entity.*;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final WarehouseService warehouseService;
    private final ShipmentRepository shipmentRepository;
    private final WarehouseOrderAllocationRepository warehouseOrderAllocationRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final StockMovementLogRepository stockMovementLogRepository;
    private final NotificationService notificationService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository,
                            CartItemRepository cartItemRepository,
                            CustomerRepository customerRepository,
                            VendorRepository vendorRepository,
                            ProductRepository productRepository,
                            InventoryHistoryRepository inventoryHistoryRepository,
                            CouponService couponService,
                            CouponRepository couponRepository,
                            CouponUsageRepository couponUsageRepository,
                            WarehouseService warehouseService,
                            ShipmentRepository shipmentRepository,
                            WarehouseOrderAllocationRepository warehouseOrderAllocationRepository,
                            WarehouseInventoryRepository warehouseInventoryRepository,
                            StockMovementLogRepository stockMovementLogRepository,
                            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
        this.couponService = couponService;
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.warehouseService = warehouseService;
        this.shipmentRepository = shipmentRepository;
        this.warehouseOrderAllocationRepository = warehouseOrderAllocationRepository;
        this.warehouseInventoryRepository = warehouseInventoryRepository;
        this.stockMovementLogRepository = stockMovementLogRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public OrderDTO checkout(String customerEmail, CreateOrderRequest request) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        List<CartItem> cartItems = cartItemRepository.findByCustomerId(customer.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cannot place order with an empty shopping cart.");
        }

        BigDecimal grossTotal = BigDecimal.ZERO;
        Order order = new Order();
        order.setCustomer(customer);
        order.setShippingAddress(request.getShippingAddress() != null && !request.getShippingAddress().isBlank()
                ? request.getShippingAddress()
                : (customer.getAddress() != null ? customer.getAddress() : "Default Address"));
        order.setStatus(OrderStatus.CONFIRMED);

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Deduct stock quantity
            int newStock = product.getStockQuantity() - cartItem.getQuantity();
            product.setStockQuantity(newStock);
            productRepository.save(product);

            // Record inventory history
            InventoryHistory history = new InventoryHistory(
                    product,
                    -cartItem.getQuantity(),
                    newStock,
                    "ORDER_CHECKOUT"
            );
            inventoryHistoryRepository.save(history);

            // Use finalPrice if available, otherwise price
            BigDecimal effectivePrice = product.getFinalPrice() != null ? product.getFinalPrice() : product.getPrice();
            BigDecimal itemTotal = effectivePrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            grossTotal = grossTotal.add(itemTotal);

            // Calculate Vendor Commission
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

        // Apply Coupon logic if requested
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

        // Record Coupon Usage if coupon was applied
        if (order.getCouponCode() != null && !order.getCouponCode().isBlank()) {
            couponRepository.findByCode(order.getCouponCode()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);

                CouponUsage usage = new CouponUsage(coupon, customer, savedOrder, order.getDiscountAmount());
                couponUsageRepository.save(usage);
            });
        }

        // Clear cart
        cartItemRepository.deleteByCustomerId(customer.getId());

        // Send Order Placed Notification
        notificationService.sendOrderPlacedEmail(savedOrder);

        return new OrderDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrderHistory(String customerEmail) {
        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + customerEmail));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(OrderDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderItemDTO> getVendorSalesOrders(String vendorEmail) {
        Vendor vendor = vendorRepository.findByEmail(vendorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for email: " + vendorEmail));

        return orderItemRepository.findByVendorIdOrderByOrderCreatedAtDesc(vendor.getId()).stream()
                .map(OrderItemDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (OrderStatus.CANCELLED.equals(status)) {
            return cancelOrderInternal(order);
        }

        if (OrderStatus.DELIVERED.equals(status)) {
            shipmentRepository.findByOrderId(order.getId()).ifPresentOrElse(
                shipment -> {
                    if (!ShipmentStatus.DELIVERED.equals(shipment.getStatus())) {
                        throw new IllegalStateException("Order #" + order.getId() + " cannot be marked DELIVERED directly before shipment is DELIVERED. Current shipment status: " + shipment.getStatus());
                    }
                },
                () -> {
                    throw new IllegalStateException("Order #" + order.getId() + " cannot be marked DELIVERED directly without completing the shipment workflow.");
                }
            );
        }

        order.setStatus(status);
        return new OrderDTO(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderDTO cancelOrder(Long orderId, String customerEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (!order.getCustomer().getEmail().equalsIgnoreCase(customerEmail)) {
            throw new IllegalStateException("Access denied: Order #" + orderId + " does not belong to you.");
        }

        if (OrderStatus.CANCELLED.equals(order.getStatus())) {
            return new OrderDTO(order);
        }

        if (OrderStatus.SHIPPED.equals(order.getStatus()) ||
            OrderStatus.DELIVERED.equals(order.getStatus()) ||
            OrderStatus.RETURNED.equals(order.getStatus()) ||
            OrderStatus.REFUNDED.equals(order.getStatus())) {
            throw new IllegalStateException("Order #" + orderId + " cannot be cancelled because it is in " + order.getStatus() + " status.");
        }

        return cancelOrderInternal(order);
    }

    private OrderDTO cancelOrderInternal(Order order) {
        if (OrderStatus.CANCELLED.equals(order.getStatus())) {
            return new OrderDTO(order);
        }

        // 1. Restore Product Stock & Inventory History
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int restoredStock = product.getStockQuantity() + item.getQuantity();
            product.setStockQuantity(restoredStock);
            productRepository.save(product);

            InventoryHistory history = new InventoryHistory(
                    product,
                    item.getQuantity(),
                    restoredStock,
                    "ORDER_CANCELLED"
            );
            inventoryHistoryRepository.save(history);
        }

        // 2. Release & Restore Warehouse Inventory allocations if any exist
        List<WarehouseOrderAllocation> allocations = warehouseOrderAllocationRepository.findByOrderId(order.getId());
        for (WarehouseOrderAllocation alloc : allocations) {
            if (!WarehouseAllocationStatus.CANCELLED.equals(alloc.getStatus())) {
                WarehouseInventory inventory = warehouseInventoryRepository
                        .findByWarehouseIdAndProductId(alloc.getWarehouse().getId(), alloc.getProduct().getId())
                        .orElse(null);

                if (inventory != null) {
                    int allocQty = alloc.getAllocatedQuantity();
                    int newAllocated = Math.max(0, inventory.getAllocatedQuantity() - allocQty);
                    int newAvailable = inventory.getAvailableQuantity() + allocQty;

                    inventory.setAllocatedQuantity(newAllocated);
                    inventory.setAvailableQuantity(newAvailable);
                    warehouseInventoryRepository.save(inventory);

                    // Sync product stock to total available
                    int totalAvail = warehouseInventoryRepository.findByProductId(alloc.getProduct().getId())
                            .stream().mapToInt(WarehouseInventory::getAvailableQuantity).sum();
                    alloc.getProduct().setStockQuantity(totalAvail);
                    productRepository.save(alloc.getProduct());

                    StockMovementLog log = new StockMovementLog(
                            alloc.getProduct(), alloc.getWarehouse(), order,
                            "ALLOCATED", "AVAILABLE",
                            StockMovementStage.AVAILABLE,
                            allocQty,
                            "Released allocated stock due to Order #" + order.getId() + " cancellation");
                    stockMovementLogRepository.save(log);
                }

                alloc.setStatus(WarehouseAllocationStatus.CANCELLED);
                warehouseOrderAllocationRepository.save(alloc);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        return new OrderDTO(orderRepository.save(order));
    }
}
