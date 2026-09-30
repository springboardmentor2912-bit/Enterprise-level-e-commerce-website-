package com.shopstack.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.model.Order;
import com.shopstack.backend.model.OrderItem;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.Refund;
import com.shopstack.backend.model.Settlement;
import com.shopstack.backend.repository.OrderItemRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.RefundRepository;
import com.shopstack.backend.repository.SettlementRepository;
import com.shopstack.backend.service.PaymentService;
import com.shopstack.backend.service.WarehouseService;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.model.User;
import com.shopstack.backend.event.OrderShippedEvent;
import com.shopstack.backend.event.OrderDeliveredEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class VendorController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private RefundRepository refundRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private WarehouseService warehouseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // Get Analytics for a Vendor
    @GetMapping("/{vendorId}/analytics")
    public ResponseEntity<?> getVendorAnalytics(@PathVariable Long vendorId) {
        // 1. Fetch vendor's products
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getVendorId() != null && p.getVendorId().equals(vendorId))
                .collect(Collectors.toList());

        // 2. Fetch vendor's order line items
        List<OrderItem> orderItems = orderItemRepository.findByVendorId(vendorId);

        // 3. Perform aggregate calculations (excluding refunded & cancelled transactions)
        double totalRevenue = 0;
        int totalItemsSold = 0;
        Set<String> distinctOrderIds = new HashSet<>();
        Map<String, Integer> productSales = new HashMap<>();
        
        for (OrderItem item : orderItems) {
            Optional<Order> orderOpt = orderRepository.findByOrderId(item.getOrderId());
            if (orderOpt.isPresent()) {
                Order ord = orderOpt.get();
                // Exclude cancelled and fully refunded orders
                if ("CANCELLED".equalsIgnoreCase(ord.getStatus()) || 
                    "REFUNDED".equalsIgnoreCase(ord.getStatus()) || 
                    "REFUNDED".equalsIgnoreCase(ord.getPaymentStatus()) ||
                    "FAILED".equalsIgnoreCase(ord.getPaymentStatus())) {
                    continue;
                }
                
                // If partially refunded, deduct refunded proportion
                if ("PARTIALLY_REFUNDED".equalsIgnoreCase(ord.getPaymentStatus())) {
                    double itemTotal = item.getPrice() * item.getQuantity();
                    double refundSum = refundRepository.findByOrderId(ord.getOrderId()).stream()
                            .filter(r -> "PROCESSED".equalsIgnoreCase(r.getStatus()))
                            .mapToDouble(Refund::getAmount)
                            .sum();
                    double ratio = ord.getTotalAmount() > 0 ? Math.max(0, 1.0 - (refundSum / ord.getTotalAmount())) : 0.0;
                    totalRevenue += itemTotal * ratio;
                    totalItemsSold += item.getQuantity();
                    distinctOrderIds.add(item.getOrderId());
                    productSales.put(item.getProductName(), productSales.getOrDefault(item.getProductName(), 0) + item.getQuantity());
                } else {
                    totalRevenue += item.getPrice() * item.getQuantity();
                    totalItemsSold += item.getQuantity();
                    distinctOrderIds.add(item.getOrderId());
                    productSales.put(item.getProductName(), productSales.getOrDefault(item.getProductName(), 0) + item.getQuantity());
                }
            }
        }

        double averageOrderValue = distinctOrderIds.isEmpty() ? 0 : (totalRevenue / distinctOrderIds.size());
        
        // Count products with stock < 5
        long lowStockCount = products.stream().filter(p -> p.getStock() != null && p.getStock() < 5).count();

        List<Map<String, Object>> topSellers = productSales.entrySet().stream()
                .sorted((e1, e2) -> e2.getValue().compareTo(e1.getValue()))
                .limit(5)
                .map(entry -> Map.<String, Object>of("name", entry.getKey(), "salesCount", entry.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalRevenue", Math.round(totalRevenue * 100.0) / 100.0);
        analytics.put("totalOrders", distinctOrderIds.size());
        analytics.put("totalItemsSold", totalItemsSold);
        analytics.put("averageOrderValue", Math.round(averageOrderValue * 100.0) / 100.0);
        analytics.put("lowStockCount", lowStockCount);
        analytics.put("topSellingProducts", topSellers);
        analytics.put("productsCount", products.size());

        return ResponseEntity.ok(analytics);
    }

    // Get all orders containing products belonging to this vendor
    @GetMapping("/{vendorId}/orders")
    public ResponseEntity<?> getVendorOrders(@PathVariable Long vendorId) {
        List<OrderItem> orderItems = orderItemRepository.findByVendorIdOrderByIdDesc(vendorId);
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (OrderItem item : orderItems) {
            // Find overall order details
            Optional<Order> orderOpt = orderRepository.findAll().stream()
                    .filter(o -> o.getOrderId().equals(item.getOrderId()))
                    .findFirst();
            
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                if (order.getOrderId() != null && order.getOrderId().startsWith("ORD-FAIL-") || "FAILED".equalsIgnoreCase(order.getPaymentStatus())) {
                    continue;
                }
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("orderItemId", item.getId());
                orderMap.put("orderId", order.getOrderId());
                orderMap.put("date", order.getDate());
                orderMap.put("productName", item.getProductName());
                orderMap.put("price", item.getPrice());
                orderMap.put("quantity", item.getQuantity());
                orderMap.put("totalAmount", item.getPrice() * item.getQuantity());
                orderMap.put("status", order.getStatus()); // Shared order status
                orderMap.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus() : "PENDING");
                orderMap.put("paymentMethod", order.getPaymentMethod());
                response.add(orderMap);
            }
        }
        
        return ResponseEntity.ok(response);
    }

    // Update order status (Vendor action)
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        // Find the order
        Optional<Order> orderOpt = orderRepository.findAll().stream()
                .filter(o -> o.getOrderId().equals(orderId))
                .findFirst();

        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String oldStatus = order.getStatus() != null ? order.getStatus() : "";
            order.setStatus(newStatus.toUpperCase());
            orderRepository.save(order);

            // Handle COD Order Delivery: mark as PAID and generate vendor settlements
            if ("DELIVERED".equalsIgnoreCase(newStatus) && "COD".equalsIgnoreCase(order.getPaymentMethod())
                    && "PENDING".equalsIgnoreCase(order.getPaymentStatus())) {
                order.setPaymentStatus("PAID");
                orderRepository.save(order);
                List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
                paymentService.createSettlementsForOrder(order, items);
            }

            // Restore product stock inventory if status transitions to CANCELLED or REFUNDED
            if (("CANCELLED".equalsIgnoreCase(newStatus) || "REFUNDED".equalsIgnoreCase(newStatus))
                    && !"CANCELLED".equalsIgnoreCase(oldStatus) && !"REFUNDED".equalsIgnoreCase(oldStatus)) {
                // Release warehouse stock allocations and sync stock representation
                try {
                    warehouseService.releaseAllocations(order.getOrderId());
                } catch (Exception e) {
                    System.err.println("Failed to release allocations for order: " + order.getOrderId() + ". Error: " + e.getMessage());
                }
            }

            // Publish OrderShippedEvent or OrderDeliveredEvent
            try {
                User user = (order.getUserId() != null) ? userRepository.findById(order.getUserId()).orElse(null) : null;
                String timestamp = new SimpleDateFormat("MMM dd, yyyy HH:mm").format(new Date());

                if ("SHIPPED".equalsIgnoreCase(newStatus) && !"SHIPPED".equalsIgnoreCase(oldStatus)) {
                    String tracking = "TRK-" + Math.abs(order.getOrderId().hashCode());
                    eventPublisher.publishEvent(new OrderShippedEvent(order, tracking, "Vendor Direct Dispatch", timestamp, user));
                } else if ("DELIVERED".equalsIgnoreCase(newStatus) && !"DELIVERED".equalsIgnoreCase(oldStatus)) {
                    eventPublisher.publishEvent(new OrderDeliveredEvent(order, timestamp, user));
                }
            } catch (Exception e) {
                System.err.println("[VendorController] Error publishing status change event: " + e.getMessage());
            }

            return ResponseEntity.ok(order);
        }

        return ResponseEntity.notFound().build();
    }

    // Get Vendor Settlement & Payout Ledger
    @GetMapping("/{vendorId}/settlements")
    public ResponseEntity<?> getVendorSettlements(@PathVariable Long vendorId) {
        List<Settlement> settlements = settlementRepository.findByVendorIdOrderByIdDesc(vendorId);
        List<Order> orders = orderRepository.findAll();
        Map<String, Order> orderMap = orders.stream()
                .filter(o -> o.getOrderId() != null)
                .collect(Collectors.toMap(Order::getOrderId, o -> o, (a, b) -> a));

        double totalGross = 0;
        double totalCommission = 0;
        double totalNetPayout = 0;
        double pendingPayout = 0;
        double settledPayout = 0;

        for (Settlement s : settlements) {
            Order matchedOrder = orderMap.get(s.getOrderId());
            String ordSt = (matchedOrder != null && matchedOrder.getStatus() != null) ? matchedOrder.getStatus().toUpperCase() : "";

            // Auto-populate missing createdAt from order date
            if ((s.getCreatedAt() == null || s.getCreatedAt().trim().isEmpty()) && matchedOrder != null && matchedOrder.getDate() != null) {
                s.setCreatedAt(matchedOrder.getDate());
                try { settlementRepository.save(s); } catch (Exception ignored) {}
            }

            // Auto-populate missing settledAt for SETTLED status
            if ("SETTLED".equalsIgnoreCase(s.getStatus()) && (s.getSettledAt() == null || s.getSettledAt().trim().isEmpty())) {
                s.setSettledAt(s.getCreatedAt() != null ? s.getCreatedAt() : new SimpleDateFormat("MMM dd, yyyy").format(new Date()));
                try { settlementRepository.save(s); } catch (Exception ignored) {}
            }
            
            // If order is refunded or cancelled, sync settlement status to REFUNDED / CANCELLED and zero out net payout
            if ("REFUNDED".equalsIgnoreCase(ordSt) || "CANCELLED".equalsIgnoreCase(ordSt)) {
                if (!"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                    if (!"SETTLED".equalsIgnoreCase(s.getStatus())) {
                        s.setStatus("REFUNDED".equalsIgnoreCase(ordSt) ? "REFUNDED" : "CANCELLED");
                        s.setNetPayoutAmount(0.0);
                        try { settlementRepository.save(s); } catch (Exception ignored) {}
                    }
                }
            }

            // 1. Gross Volume includes all non-void order sales
            if (!"VOID".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus())) {
                totalGross += Math.abs(s.getGrossAmount());
            }

            // 2. Refunded orders contribute 0 to Platform Revenue, Pending Payouts, and Settled Payouts
            if (!"REFUNDED".equalsIgnoreCase(s.getStatus()) && !"CANCELLED".equalsIgnoreCase(s.getStatus()) && !"VOID".equalsIgnoreCase(s.getStatus()) && !"REFUNDED".equalsIgnoreCase(ordSt) && !"CANCELLED".equalsIgnoreCase(ordSt)) {
                totalCommission += s.getCommissionAmount();
                totalNetPayout += s.getNetPayoutAmount();
                if ("SETTLED".equalsIgnoreCase(s.getStatus())) {
                    settledPayout += s.getNetPayoutAmount();
                } else if ("PENDING".equalsIgnoreCase(s.getStatus())) {
                    pendingPayout += s.getNetPayoutAmount();
                }
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalGross", Math.round(totalGross * 100.0) / 100.0);
        summary.put("totalCommission", Math.round(totalCommission * 100.0) / 100.0);
        summary.put("totalNetPayout", Math.round(totalNetPayout * 100.0) / 100.0);
        summary.put("pendingPayout", Math.round(pendingPayout * 100.0) / 100.0);
        summary.put("settledPayout", Math.round(settledPayout * 100.0) / 100.0);

        Map<String, Object> response = new HashMap<>();
        response.put("summary", summary);
        response.put("settlements", settlements);

        return ResponseEntity.ok(response);
    }
}
