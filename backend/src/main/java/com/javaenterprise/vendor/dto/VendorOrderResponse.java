package com.javaenterprise.vendor.dto;

import com.javaenterprise.order.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class VendorOrderResponse {

    private Long orderId;

    private String customerName;

    private String customerEmail;

    private LocalDateTime orderDate;

    private OrderStatus status;

    private BigDecimal totalAmount;

    private List<VendorOrderItemResponse> items;

    private String couponCode;
    // 🆕 coupon used on the order
    private BigDecimal discountAmount;     // 🆕 coupon discount amount
}