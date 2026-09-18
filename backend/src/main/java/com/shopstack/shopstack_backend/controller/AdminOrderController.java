package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.dto.response.ApiResponse;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;
import com.shopstack.shopstack_backend.service.AdminOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(
            AdminOrderService adminOrderService) {

        this.adminOrderService =
                adminOrderService;
    }

    // =========================
    // GET ALL ORDERS
    // =========================

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<OrderResponse>>>
    getAllOrders() {

        System.out.println(
                "===== ADMIN GET ALL ORDERS API HIT ====="
        );

        List<OrderResponse> orders =
                adminOrderService.getAllOrders();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Admin Orders Retrieved Successfully",
                        orders
                )
        );
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<
            ApiResponse<OrderResponse>>
    getOrderById(
            @PathVariable Long id) {

        OrderResponse response =
                adminOrderService.getOrderById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Admin Order Retrieved Successfully",
                        response
                )
        );
    }
}