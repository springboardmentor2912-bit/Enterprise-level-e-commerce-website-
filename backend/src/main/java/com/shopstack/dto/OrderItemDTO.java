package com.shopstack.dto;

import com.shopstack.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemDTO {

    private Long id;
    private Long orderId;
    private String orderStatus;
    private ProductDTO product;
    private VendorDTO vendor;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal commissionRate;
    private BigDecimal commissionAmount;
    private BigDecimal vendorEarning;

    public OrderItemDTO() {
    }

    public OrderItemDTO(OrderItem item) {
        this.id = item.getId();
        this.orderId = item.getOrder() != null ? item.getOrder().getId() : null;
        this.orderStatus = item.getOrder() != null ? item.getOrder().getStatus().name() : null;
        this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
        this.vendor = item.getVendor() != null ? new VendorDTO(item.getVendor()) : null;
        this.quantity = item.getQuantity();
        this.priceAtPurchase = item.getPriceAtPurchase();
        this.commissionRate = item.getCommissionRate();
        this.commissionAmount = item.getCommissionAmount();
        this.vendorEarning = item.getVendorEarning();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public VendorDTO getVendor() {
        return vendor;
    }

    public void setVendor(VendorDTO vendor) {
        this.vendor = vendor;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public BigDecimal getVendorEarning() {
        return vendorEarning;
    }

    public void setVendorEarning(BigDecimal vendorEarning) {
        this.vendorEarning = vendorEarning;
    }
}
