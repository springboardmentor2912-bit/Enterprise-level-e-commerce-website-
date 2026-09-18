package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.OrderItemResponse;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.service.AdminOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminOrderServiceImpl
        implements AdminOrderService {

    private final OrderRepository orderRepository;

    public AdminOrderServiceImpl(
            OrderRepository orderRepository) {

        this.orderRepository = orderRepository;
    }

    // =========================
    // GET ALL ORDERS
    // =========================

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository
                .findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================
    // GET ORDER BY ID
    // =========================

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        Order order = orderRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found"
                        ));

        return mapToResponse(order);
    }

    // =========================
    // MAP ORDER TO RESPONSE
    // =========================

    private OrderResponse mapToResponse(
            Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item ->
                                new OrderItemResponse(
                                        item.getProductId(),
                                        item.getProductName(),
                                        item.getPrice(),
                                        item.getQuantity(),
                                        item.getSubtotal()
                                )
                        )
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getCustomerEmail(),
                order.getCustomerName(),
                order.getPhone(),
                order.getAddress(),
                order.getCity(),
                order.getState(),
                order.getPincode(),
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt(),
                items
        );
    }
}