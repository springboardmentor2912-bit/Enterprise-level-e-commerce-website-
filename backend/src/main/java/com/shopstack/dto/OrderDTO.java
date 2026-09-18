package com.shopstack.dto;

import com.shopstack.entity.Order;
import com.shopstack.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {

    private Long id;
    private CustomerDTO customer;
    private BigDecimal totalAmount;
    private BigDecimal grossAmount;
    private String couponCode;
    private BigDecimal discountAmount;
    private OrderStatus status;
    private String shippingAddress;
    private List<OrderItemDTO> items;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private LocalDateTime createdAt;

    public OrderDTO() {
    }

    public OrderDTO(Order order) {
        this.id = order.getId();
        this.customer = order.getCustomer() != null ? new CustomerDTO(order.getCustomer()) : null;
        this.totalAmount = order.getTotalAmount();
        this.grossAmount = order.getGrossAmount();
        this.couponCode = order.getCouponCode();
        this.discountAmount = order.getDiscountAmount();
        this.status = order.getStatus();
        this.shippingAddress = order.getShippingAddress();
        this.items = order.getItems() != null ? order.getItems().stream().map(OrderItemDTO::new).collect(Collectors.toList()) : null;
        if (order.getWarehouse() != null) {
            this.warehouseId = order.getWarehouse().getId();
            this.warehouseName = order.getWarehouse().getName();
            this.warehouseCode = order.getWarehouse().getCode();
        }
        this.createdAt = order.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getGrossAmount() {
        return grossAmount;
    }

    public void setGrossAmount(BigDecimal grossAmount) {
        this.grossAmount = grossAmount;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }

    public String getWarehouseCode() {
        return warehouseCode;
    }

    public void setWarehouseCode(String warehouseCode) {
        this.warehouseCode = warehouseCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
