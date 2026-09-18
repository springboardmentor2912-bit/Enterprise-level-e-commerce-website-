package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.dto.request.OrderRequest;
import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;
import com.shopstack.shopstack_backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================
    // CREATE ORDER
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request) {

        System.out.println(
                "===== CREATE ORDER API HIT ====="
        );

        OrderResponse response =
                orderService.createOrder(request);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Placed Successfully",
                        response
                )
        );
    }

    // =========================
    // GET MY ORDERS
    // =========================

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {

        System.out.println(
                "===== GET MY ORDERS API HIT ====="
        );

        List<OrderResponse> orders =
                orderService.getMyOrders();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Orders Retrieved Successfully",
                        orders
                )
        );
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long id) {

        OrderResponse response =
                orderService.getOrderById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Retrieved Successfully",
                        response
                )
        );
    }

    // =========================
    // CANCEL ORDER
    // =========================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id) {

        System.out.println(
                "===== CANCEL ORDER API HIT ====="
        );

        OrderResponse response =
                orderService.cancelOrder(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Cancelled Successfully",
                        response
                )
        );
    }

    // =========================
    // REQUEST RETURN
    // =========================

    @PutMapping("/{id}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long id) {

        System.out.println(
                "===== RETURN ORDER API HIT ====="
        );

        OrderResponse response =
                orderService.requestReturn(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Return Requested Successfully",
                        response
                )
        );
    }

    // =========================
    // UPDATE ORDER STATUS
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        System.out.println(
                "===== UPDATE ORDER STATUS API HIT ====="
        );

        OrderResponse response =
                orderService.updateOrderStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Order Status Updated Successfully",
                        response
                )
        );
    }

    // =========================
    // ALLOCATE WAREHOUSE
    // =========================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{orderId}/warehouse/{warehouseId}")
    public ResponseEntity<ApiResponse<OrderResponse>> allocateWarehouse(
            @PathVariable Long orderId,
            @PathVariable Long warehouseId) {

        System.out.println(
                "===== ALLOCATE WAREHOUSE API HIT ====="
        );

        OrderResponse response =
                orderService.allocateWarehouse(
                        orderId,
                        warehouseId
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Warehouse Allocated Successfully",
                        response
                )
        );
    }
}