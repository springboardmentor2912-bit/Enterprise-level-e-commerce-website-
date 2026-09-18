package com.shopstack.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateOrderRequest {

    @NotEmpty(message = "Items list cannot be empty")
    private List<OrderItemRequest> items;

    private String shippingAddress;

    private com.shopstack.model.PaymentMethod paymentMethod = com.shopstack.model.PaymentMethod.CARD;

    private String couponCode;

    private Double discountAmount = 0.0;

    public CreateOrderRequest() {}

    public CreateOrderRequest(List<OrderItemRequest> items, String shippingAddress) {
        this.items = items;
        this.shippingAddress = shippingAddress;
    }

    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public com.shopstack.model.PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(com.shopstack.model.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public static class OrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
