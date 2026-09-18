package com.infosys.auth.controller;

import com.infosys.auth.model.CartItem;
import com.infosys.auth.model.Order;
import com.infosys.auth.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/cart/{userId}")
    public ResponseEntity<List<CartItem>> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(customerService.getCart(userId));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<CartItem> addToCart(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        Long productId = Long.valueOf(payload.get("productId").toString());
        Integer quantity = payload.containsKey("quantity") ? Integer.valueOf(payload.get("quantity").toString()) : 1;
        return ResponseEntity.ok(customerService.addToCart(userId, productId, quantity));
    }

    @PutMapping("/cart/{cartItemId}")
    public ResponseEntity<CartItem> updateCartQuantity(
            @PathVariable Long cartItemId,
            @RequestBody Map<String, Integer> payload) {
        Integer quantity = payload.get("quantity");
        return ResponseEntity.ok(customerService.updateCartQuantity(cartItemId, quantity));
    }

    @DeleteMapping("/cart/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartItemId) {
        customerService.removeFromCart(cartItemId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String customerName = payload.getOrDefault("customerName", "Customer").toString();
        String shippingAddress = payload.getOrDefault("shippingAddress", "Standard Delivery Address").toString();
        String couponCode = payload.containsKey("couponCode") && payload.get("couponCode") != null ? payload.get("couponCode").toString() : null;
        return ResponseEntity.ok(customerService.checkout(userId, customerName, shippingAddress, couponCode));
    }

    @GetMapping("/orders/{userId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(customerService.getCustomerOrders(userId));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId, @RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Order cancelledOrder = customerService.cancelOrder(orderId, userId);
            return ResponseEntity.ok(cancelledOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
