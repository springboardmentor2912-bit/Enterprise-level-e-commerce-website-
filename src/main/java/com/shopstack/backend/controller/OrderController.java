package com.shopstack.backend.controller;

import com.shopstack.backend.dto.OrderRequest;
import com.shopstack.backend.dto.OrderResponse;
import com.shopstack.backend.entity.OrderStatus;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtService jwtService;


    // =========================================================
    // PLACE ORDER
    // =========================================================

    @PostMapping
    public OrderResponse placeOrder(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody OrderRequest request
    ) {

        String token = authHeader.substring(7);

        String email =
                jwtService.extractEmail(token);

        return orderService.placeOrder(
                email,
                request
        );
    }


    // =========================================================
    // GET CUSTOMER ORDERS
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getMyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token =
                    authHeader.substring(7);

            String email =
                    jwtService.extractEmail(token);

            List<OrderResponse> orders =
                    orderService.getMyOrders(email);

            return ResponseEntity.ok(orders);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token =
                    authHeader.substring(7);

            String email =
                    jwtService.extractEmail(token);

            String response =
                    orderService.updateOrderStatus(
                            id,
                            email,
                            status
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================================
    // GET VENDOR ORDERS
    // =========================================================

    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorOrders(
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token =
                    authHeader.substring(7);

            String email =
                    jwtService.extractEmail(token);

            List<OrderResponse> orders =
                    orderService.getVendorOrders(email);

            return ResponseEntity.ok(orders);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


}