package com.javaenterprise.warehouse.controller;

import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.warehouse.service.WarehouseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseOrderService warehouseOrderService;

    @GetMapping("/orders")
    public List<OrderResponse> getMyOrders(Authentication authentication) {
        return warehouseOrderService.getAssignedOrders(authentication);
    }
}