package com.shopstack.service;

import com.shopstack.dto.CreateOrderRequest;
import com.shopstack.dto.OrderDTO;
import com.shopstack.dto.OrderItemDTO;
import com.shopstack.entity.OrderStatus;

import java.util.List;

public interface OrderService {
    OrderDTO checkout(String customerEmail, CreateOrderRequest request);
    List<OrderDTO> getCustomerOrderHistory(String customerEmail);
    List<OrderItemDTO> getVendorSalesOrders(String vendorEmail);
    OrderDTO updateOrderStatus(Long orderId, OrderStatus status);
    OrderDTO cancelOrder(Long orderId, String customerEmail);
}
