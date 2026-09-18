package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.OrderResponse;

import java.util.List;

public interface AdminOrderService {

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(Long id);
}