package com.javaenterprise.order.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestParam Long addressId,
                                                  @RequestParam(required = false) String couponCode, // 🆕 ADD THIS
                                                  Authentication authentication) {
        // 🆕 PASS ALL 3 ARGUMENTS
        return ResponseEntity.ok(orderService.checkout(authentication, addressId, couponCode));
    }

    @GetMapping
    public List<OrderResponse> getOrders(Authentication authentication) {
        return orderService.getOrders(authentication);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(@PathVariable Long id,
                                  Authentication authentication) {
        return orderService.getOrder(id, authentication);
    }

    @PutMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable Long id,
                            Authentication authentication) {
        orderService.cancelOrder(id, authentication);
    }
    @PutMapping("/{id}/return")
    public ResponseEntity<?> requestReturn(@PathVariable Long id,
                                           @RequestParam String reason,
                                           Authentication authentication) {
        try {
            orderService.requestReturn(id, reason, authentication);
            return ResponseEntity.ok("Return requested successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/admin/{orderId}/allocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> allocateWarehouse(
            @PathVariable Long orderId,
            @RequestParam Long warehouseId) {

        orderService.allocateOrderToWarehouse(orderId, warehouseId); // Make sure to add this method to OrderService.java
        return ResponseEntity.ok("Order successfully allocated to warehouse");
    }
}