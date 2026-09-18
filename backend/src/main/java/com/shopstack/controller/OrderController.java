package com.shopstack.controller;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.model.Order;
import com.shopstack.model.OrderStatus;
import com.shopstack.model.Role;
import com.shopstack.model.VendorProfile;
import com.shopstack.security.UserPrincipal;
import com.shopstack.service.OrderService;
import com.shopstack.service.VendorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final VendorService vendorService;

    public OrderController(OrderService orderService, VendorService vendorService) {
        this.orderService = orderService;
        this.vendorService = vendorService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Order>> createOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(orderService.createOrders(principal.getId(), request));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(principal.getId()));
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<List<Order>> getVendorOrders(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long vendorId) {
        
        // Vendor isolation check: Vendors can only view their own store orders
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            VendorProfile profile = vendorService.getVendorByUserId(principal.getId());
            if (!profile.getId().equals(vendorId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: Vendors cannot access another store's orders.");
            }
        }

        return ResponseEntity.ok(orderService.getOrdersByVendor(vendorId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        // Vendor isolation check for updating order status
        if (!principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            VendorProfile profile = vendorService.getVendorByUserId(principal.getId());
            if (!orderService.isOrderOwnedByVendor(id, profile.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You do not own this order.");
            }
        }

        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
