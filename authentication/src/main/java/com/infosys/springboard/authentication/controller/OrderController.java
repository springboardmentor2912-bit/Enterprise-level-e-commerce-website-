
package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.service.OrderService;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================================================
    // GET ALL ORDERS - ADMIN
    // =========================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    // =========================================================
    // GET ORDER BY ID - ADMIN
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    // =========================================================
    // UPDATE ORDER STATUS - ADMIN
    // =========================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        id,
                        status
                )
        );
    }

    // =========================================================
    // GET CUSTOMER ORDERS
    // =========================================================

    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(
            @RequestParam String customerEmail) {

        return ResponseEntity.ok(
                orderService.getCustomerOrders(
                        customerEmail
                )
        );
    }

    // =========================================================
    // GET CUSTOMER ORDER BY ID
    // =========================================================

    @GetMapping("/customer/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> getCustomerOrderById(
            @PathVariable Long id,
            @RequestParam String customerEmail) {

        return ResponseEntity.ok(
                orderService.getCustomerOrderById(
                        id,
                        customerEmail
                )
        );
    }

    // =========================================================
    // GET VENDOR ORDERS
    // =========================================================

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<OrderResponse>> getVendorOrders(
            @RequestParam String vendorEmail) {

        return ResponseEntity.ok(
                orderService.getVendorOrders(
                        vendorEmail
                )
        );
    }

    // =========================================================
    // UPDATE VENDOR ORDER STATUS
    // =========================================================

    @PutMapping("/vendor/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<OrderResponse> updateVendorOrderStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam String vendorEmail) {

        return ResponseEntity.ok(
                orderService.updateVendorOrderStatus(
                        id,
                        status,
                        vendorEmail
                )
        );
    }

    // =========================================================
    // CANCEL ORDER - CUSTOMER
    // =========================================================

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            @RequestParam String customerEmail) {

        return ResponseEntity.ok(
                orderService.cancelOrder(
                        id,
                        customerEmail
                )
        );
    }

    // =========================================================
    // REQUEST RETURN - CUSTOMER
    // =========================================================

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderResponse> requestReturn(
            @PathVariable Long id,
            @RequestParam String customerEmail,
            @RequestParam String reason) {

        return ResponseEntity.ok(
                orderService.requestReturn(
                        id,
                        customerEmail,
                        reason
                )
        );
    }

    // =========================================================
    // APPROVE RETURN - ADMIN
    // =========================================================

    @PutMapping("/{id}/return/approve")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> approveReturn(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.approveReturn(id)
        );
    }

    // =========================================================
    // REJECT RETURN - ADMIN
    // =========================================================

    @PutMapping("/{id}/return/reject")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> rejectReturn(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.rejectReturn(id)
        );
    }

    // =========================================================
    // PROCESS REFUND - ADMIN
    // =========================================================

    @PutMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<OrderResponse> processRefund(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.processRefund(id)
        );
    }
}