package com.infosys.springboard.authentication.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.dto.OrderResponse;
import com.infosys.springboard.authentication.service.OrderService;

@RestController
@RequestMapping("/admin/orders")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AdminOrderController {
private final OrderService orderService;

public AdminOrderController(OrderService orderService) {
    this.orderService = orderService;
}

@GetMapping
public ResponseEntity<List<OrderResponse>> getAllOrders() {

    List<OrderResponse> orders =
            orderService.getAllOrders();

    return ResponseEntity.ok(orders);
}

@GetMapping("/{id}")
public ResponseEntity<OrderResponse> getOrderById(
        @PathVariable Long id) {

    OrderResponse order =
            orderService.getOrderById(id);

    return ResponseEntity.ok(order);
}

@PutMapping("/{id}/status")
public ResponseEntity<OrderResponse> updateOrderStatus(
        @PathVariable Long id,
        @RequestBody StatusRequest request) {

    OrderResponse updatedOrder =
            orderService.updateOrderStatus(
                    id,
                    request.getStatus()
            );

    return ResponseEntity.ok(updatedOrder);
}
 
public static class StatusRequest {

    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}


}
