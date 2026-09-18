package com.infosys.springboard.authentication.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.service.OrderService;

@RestController
@RequestMapping("/admin/orders")
public class AdminReturnController {

    private final OrderService orderService;

    public AdminReturnController(OrderService orderService) {
        this.orderService = orderService;
    }

    // =========================================================
    // APPROVE RETURN
    // =========================================================

    @PutMapping("/{id}/return/approve")
    public ResponseEntity<OrderResponse> approveReturn(
            @PathVariable Long id) {

        OrderResponse response =
                orderService.approveReturn(id);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // REJECT RETURN
    // =========================================================

    @PutMapping("/{id}/return/reject")
    public ResponseEntity<OrderResponse> rejectReturn(
            @PathVariable Long id) {

        OrderResponse response =
                orderService.rejectReturn(id);

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // PROCESS REFUND
    // =========================================================

    @PutMapping("/{id}/refund")
    public ResponseEntity<OrderResponse> processRefund(
            @PathVariable Long id) {

        OrderResponse response =
                orderService.processRefund(id);

        return ResponseEntity.ok(response);
    }
}