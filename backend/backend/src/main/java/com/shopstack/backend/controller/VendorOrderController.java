package com.shopstack.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.NotificationType;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorOrder;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorOrderRepository;
import com.shopstack.backend.service.CouponService;
import com.shopstack.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VendorOrderController {
    private final VendorOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final NotificationService notificationService;

    public record OrderLine(Long productId, Integer quantity) {}
    public record CreateOrderRequest(String orderReference, String customerName, String customerPhone, String deliveryAddress, String paymentMethod, String deliveryMethod, String couponCode, String razorpayPaymentId, List<OrderLine> items) {}
    public record QuoteRequest(List<OrderLine> items, String couponCode) {}
    public record RefundRequest(String reason, String details) {}

    @PostMapping("/orders/quote")
    public ResponseEntity<?> quoteOrder(@RequestBody QuoteRequest request) {
        if (request == null || request.items() == null || request.items().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Order items are required"));
        }

        double subtotal = 0;
        for (OrderLine line : request.items()) {
            if (line == null || line.quantity() == null || line.quantity() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Each item must have a positive quantity"));
            }
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId()));
            double lineTotal = product.getSalePrice() * line.quantity();
            subtotal += lineTotal;
        }
        CouponService.CouponCalculation coupon = couponService.calculate(request.couponCode(), subtotal);
        double commission = coupon.total() * User.VENDOR_COMMISSION_PERCENTAGE / 100;
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("subtotal", subtotal);
        response.put("commission", commission);
        response.put("discount", coupon.discount());
        response.put("total", coupon.total());
        response.put("couponCode", coupon.code());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/orders")
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        User customer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        // Use the authenticated account as the source of truth. Browser
        // supplied names can be stale when several role tabs are open.
        String customerName = customer.getDisplayName();

        double subtotal = 0;
        for (OrderLine line : request.items()) {
            Product product = productRepository.findById(line.productId()).orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId()));
            subtotal += product.getSalePrice() * line.quantity();
        }
        CouponService.CouponCalculation coupon = couponService.calculateAndConsume(request.couponCode(), subtotal);

        double customerOrderTotal = 0;

        for (OrderLine line : request.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId()));
            VendorOrder order = new VendorOrder();
            order.setVendor(product.getVendor());
            order.setProductId(product.getId());
            order.setOrderReference(request.orderReference());
            order.setProductName(product.getName());
            order.setCustomerName(customerName);
            order.setCustomerEmail(customer.getEmail());
            order.setCustomerPhone(request.customerPhone());
            order.setDeliveryAddress(request.deliveryAddress());
            order.setPaymentMethod(request.paymentMethod());
            order.setDeliveryMethod(request.deliveryMethod());
            order.setQuantity(line.quantity());
            order.setUnitPrice(product.getSalePrice());
            double totalAmount = product.getSalePrice() * line.quantity();
            double commissionPercentage = User.VENDOR_COMMISSION_PERCENTAGE;
            double lineDiscount = subtotal == 0 ? 0 : coupon.discount() * totalAmount / subtotal;
            double customerTotalAmount = Math.max(0, totalAmount - lineDiscount);
            double commissionAmount = customerTotalAmount * commissionPercentage / 100;
            order.setTotalAmount(totalAmount);
            order.setCommissionPercentage(commissionPercentage);
            order.setCommissionAmount(commissionAmount);
            order.setCustomerTotalAmount(customerTotalAmount);
            order.setOrderStatus("PROCESSING");

            customerOrderTotal += customerTotalAmount;

            orderRepository.save(order);
        }
        // Create one ORDER_PLACED notification for the complete customer order.
        notificationService.createNotification(
                customer,
                NotificationType.ORDER_PLACED,
                "Order Placed Successfully",
                "Your order "
                        + request.orderReference()
                        + " has been placed successfully.",
                request.orderReference(),
                null,
                customerOrderTotal
        );

        if (request.razorpayPaymentId() != null
                && !request.razorpayPaymentId().isBlank()
                && !"Cash on Delivery".equalsIgnoreCase(request.paymentMethod())) {

            notificationService.createNotification(
                    customer,
                    NotificationType.PAYMENT_SUCCESS,
                    "Payment Successful",
                    "Your payment for order "
                            + request.orderReference()
                            + " was successful.",
                    request.orderReference(),
                    request.razorpayPaymentId(),
                    customerOrderTotal
            );
        }

        return ResponseEntity.ok(Map.of("message", "Vendor notifications created"));
    }

    @GetMapping("/vendor/orders")
    public ResponseEntity<?> getVendorOrders(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(orderRepository.findByVendorOrderByPlacedAtDesc(vendor));
    }

    @GetMapping("/vendor/orders/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(Map.of("count", orderRepository.countByVendorAndStatus(vendor, "NEW")));
    }

    @PatchMapping("/vendor/orders/read-all")
    public ResponseEntity<?> markVendorNotificationsRead(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        List<VendorOrder> unread = orderRepository.findByVendorOrderByPlacedAtDesc(vendor).stream()
                .filter(order -> "NEW".equals(order.getStatus()))
                .toList();
        unread.forEach(order -> order.setStatus("READ"));
        orderRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("updated", unread.size()));
    }

    @GetMapping("/vendor/orders/summary")
    public ResponseEntity<?> getVendorOrderSummary(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(Map.of(
                "revenue", orderRepository.sumDeliveredRevenue(vendor),
                "deliveredItems", orderRepository.sumDeliveredItems(vendor)
        ));
    }

    @GetMapping("/customer/order-notifications")
    public ResponseEntity<?> getCustomerOrderNotifications(Authentication authentication) {
        return ResponseEntity.ok(orderRepository.findByCustomerEmailOrderByPlacedAtDesc(authentication.getName()));
    }

    @PostMapping("/customer/orders/{orderReference}/refund-request")
    public ResponseEntity<?> requestRefund(@PathVariable String orderReference, @RequestBody RefundRequest request, Authentication authentication) {
        List<VendorOrder> orders = orderRepository.findByCustomerEmailAndOrderReference(authentication.getName(), orderReference);
        if (orders.isEmpty()) return ResponseEntity.notFound().build();
        if (orders.stream().anyMatch(order -> !"DELIVERED".equals(order.getOrderStatus()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "A refund can only be requested after delivery."));
        }
        if (orders.stream().anyMatch(order -> "PENDING".equals(order.getRefundStatus()) || "APPROVED".equals(order.getRefundStatus()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "A refund request already exists for this order."));
        }
        if (request == null || request.reason() == null || request.reason().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please select a refund reason."));
        }
        LocalDateTime requestedAt = LocalDateTime.now();
        orders.forEach(order -> {
            order.setPreviousOrderStatus(order.getOrderStatus());
            order.setOrderStatus("REFUND_REQUESTED");
            order.setRefundStatus("REQUESTED");
            order.setRefundReason(request.reason());
            order.setRefundDetails(request.details());
            order.setRefundRequestedAt(requestedAt);
            order.setCustomerNotificationRead(false);
        });
        orderRepository.saveAll(orders);
        return ResponseEntity.ok(Map.of("message", "Refund request submitted for admin review."));
    }

    @GetMapping("/customer/order-notifications/unread-count")
    public ResponseEntity<?> getCustomerUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", orderRepository.countByCustomerEmailAndCustomerNotificationReadFalse(authentication.getName())));
    }

    @PatchMapping("/customer/order-notifications/read-all")
    public ResponseEntity<?> markCustomerNotificationsRead(Authentication authentication) {
        List<VendorOrder> unread = orderRepository.findByCustomerEmailAndCustomerNotificationReadFalse(authentication.getName());
        unread.forEach(item -> item.setCustomerNotificationRead(true));
        orderRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("message", "Customer notifications marked as read"));
    }

    @PatchMapping("/vendor/orders/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        VendorOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order notification not found"));
        if (!order.getVendor().getId().equals(vendor.getId())) return ResponseEntity.status(403).build();
        order.setStatus("READ");
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Notification read"));
    }
}
