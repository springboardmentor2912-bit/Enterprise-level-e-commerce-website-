package com.javaenterprise.order.dto;

import com.javaenterprise.customer.dto.AddressResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long orderId;

    private LocalDateTime orderDate;

    private String status;

    private BigDecimal totalAmount;

    private List<OrderItemResponse> items;

    private AddressResponse shippingAddress;
}