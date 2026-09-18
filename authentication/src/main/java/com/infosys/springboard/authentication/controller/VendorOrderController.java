package com.infosys.springboard.authentication.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.service.OrderService;

@RestController
@RequestMapping("/vendor/orders")
public class VendorOrderController {

    private final OrderService orderService;

    public VendorOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {

        String vendorEmail = authentication.getName();

        List<OrderResponse> orders =
                orderService.getVendorOrders(vendorEmail);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        String vendorEmail = authentication.getName();

        List<OrderResponse> vendorOrders =
                orderService.getVendorOrders(vendorEmail);

        for (OrderResponse order : vendorOrders) {

            if (order.getId().equals(id)) {
                return ResponseEntity.ok(order);
            }
        }

        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String vendorEmail = authentication.getName();

        String status = request.get("status");

        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        OrderResponse response =
                orderService.updateVendorOrderStatus(
                        id,
                        status,
                        vendorEmail
                );

        return ResponseEntity.ok(response);
    }
}