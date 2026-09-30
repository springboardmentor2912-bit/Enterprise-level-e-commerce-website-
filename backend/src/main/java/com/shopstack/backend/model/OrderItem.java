package com.shopstack.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private Long productId;
    @jakarta.persistence.Column(length = 1000)
    private String productName;
    private double price;
    private Double originalPrice;
    private Double discountPercentage = 0.0;
    private int quantity;
    private Long vendorId;

    public OrderItem() {}

    public OrderItem(String orderId, Long productId, String productName, double price, int quantity, Long vendorId) {
        this.orderId = orderId;
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.originalPrice = price;
        this.discountPercentage = 0.0;
        this.quantity = quantity;
        this.vendorId = vendorId;
    }

    public OrderItem(String orderId, Long productId, String productName, double price, Double originalPrice, Double discountPercentage, int quantity, Long vendorId) {
        this.orderId = orderId;
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.originalPrice = originalPrice != null ? originalPrice : price;
        this.discountPercentage = discountPercentage != null ? discountPercentage : 0.0;
        this.quantity = quantity;
        this.vendorId = vendorId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public Double getOriginalPrice() { return originalPrice != null ? originalPrice : price; }
    public void setOriginalPrice(Double originalPrice) { this.originalPrice = originalPrice; }

    public Double getDiscountPercentage() { return discountPercentage != null ? discountPercentage : 0.0; }
    public void setDiscountPercentage(Double discountPercentage) { this.discountPercentage = discountPercentage; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
}
