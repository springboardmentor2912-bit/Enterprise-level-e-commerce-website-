package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;

    private String customerEmail;

    private String customerName;

    private String phone;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private Double totalAmount;

    private String status;

    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
}