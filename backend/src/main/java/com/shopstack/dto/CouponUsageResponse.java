package com.shopstack.dto;

import java.time.LocalDateTime;

public class CouponUsageResponse {

    private Long id;
    private Long couponId;
    private String couponCode;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long orderId;
    private String orderNumber;
    private Double orderAmount;
    private Double discountAmount;
    private Double finalAmount;
    private LocalDateTime usedAt;

    public CouponUsageResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCouponId() { return couponId; }
    public void setCouponId(Long couponId) { this.couponId = couponId; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getFinalAmount() { return finalAmount; }
    public void setFinalAmount(Double finalAmount) { this.finalAmount = finalAmount; }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }
}
