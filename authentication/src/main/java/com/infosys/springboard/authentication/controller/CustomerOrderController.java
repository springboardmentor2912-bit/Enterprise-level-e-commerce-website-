package com.infosys.springboard.authentication.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.OrderRequest;
import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/customer/orders")
public class CustomerOrderController {

    private final OrderService orderService;

    public CustomerOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================================================
    // PLACE ORDER
    // POST /customer/orders
    // =========================================================

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        OrderResponse response =
                orderService.createOrder(
                        request,
                        customerEmail
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET MY ORDERS
    // GET /customer/orders
    // =========================================================

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        List<OrderResponse> orders =
                orderService.getCustomerOrders(
                        customerEmail
                );

        return ResponseEntity.ok(orders);
    }

    // =========================================================
    // GET MY ORDER BY ID
    // GET /customer/orders/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        OrderResponse order =
                orderService.getCustomerOrderById(
                        id,
                        customerEmail
                );

        return ResponseEntity.ok(order);
    }

    // =========================================================
    // CANCEL ORDER
    // PUT /customer/orders/{id}/cancel
    // =========================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        OrderResponse response =
                orderService.cancelOrder(
                        id,
                        customerEmail
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // REQUEST RETURN
    // PUT /customer/orders/{id}/return
    // =========================================================

    @PutMapping("/{id}/return")
    public ResponseEntity<OrderResponse> requestReturn(
            @PathVariable Long id,
            @RequestBody String reason,
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        reason = reason
                .replace("\"", "")
                .trim();

        OrderResponse response =
                orderService.requestReturn(
                        id,
                        customerEmail,
                        reason
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // ORDER ERROR HANDLER
    // =========================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "message",
                        ex.getMessage() != null
                                ? ex.getMessage()
                                : "Order could not be created"
                ));
    }
}