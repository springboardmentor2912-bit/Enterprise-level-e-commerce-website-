package com.javaenterprise.warehouse.service;

import com.javaenterprise.order.dto.OrderItemResponse;
import com.javaenterprise.order.dto.OrderResponse;
import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseOrderService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public List<OrderResponse> getAssignedOrders(Authentication authentication) {
        User staff = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (staff.getWarehouse() == null) {
            throw new RuntimeException("Warehouse staff is not assigned to any warehouse.");
        }

        // Fetch orders assigned to this staff member's warehouse
        return orderRepository.findByWarehouse(staff.getWarehouse())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private OrderResponse mapToResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId()) // 🆕 Important: Include item ID for the buttons
                                .productName(item.getProduct().getName())
                                .price(item.getPrice())
                                .quantity(item.getQuantity())
                                .subtotal(item.getSubtotal())
                                .fulfillmentStatus(item.getFulfillmentStatus().name()) // 🆕 Include status
                                .build())
                        .toList())
                .shippingAddress(order.getShippingAddress() != null
                        ? com.javaenterprise.customer.dto.AddressResponse.builder()
                        .id(order.getShippingAddress().getId())
                        .fullName(order.getShippingAddress().getFullName())
                        .phone(order.getShippingAddress().getPhone())
                        .addressLine(order.getShippingAddress().getAddressLine())
                        .city(order.getShippingAddress().getCity())
                        .state(order.getShippingAddress().getState())
                        .postalCode(order.getShippingAddress().getPostalCode())
                        .country(order.getShippingAddress().getCountry())
                        .defaultAddress(order.getShippingAddress().isDefaultAddress())
                        .build() : null)
                .build();
    }
}