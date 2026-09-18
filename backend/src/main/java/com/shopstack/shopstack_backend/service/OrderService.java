package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.dto.request.OrderRequest;
import com.shopstack.shopstack_backend.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    List<OrderResponse> getMyOrders();

    OrderResponse getOrderById(Long id);

    OrderResponse cancelOrder(Long id);

    OrderResponse requestReturn(Long id);

    // =========================
    // ORDER STATUS MANAGEMENT
    // =========================

    OrderResponse updateOrderStatus(
            Long id,
            OrderStatus newStatus
    );

    // =========================
    // WAREHOUSE ALLOCATION
    // =========================

    OrderResponse allocateWarehouse(
            Long orderId,
            Long warehouseId
    );
}