package com.shopstack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double unitPrice;

    @Column(nullable = false)
    private Double subtotal;

    public OrderItem() {}

    public OrderItem(Long id, Order order, Product product, Integer quantity, Double unitPrice, Double subtotal) {
        this.id = id;
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public static OrderItemBuilder builder() {
        return new OrderItemBuilder();
    }

    public static class OrderItemBuilder {
        private Long id;
        private Order order;
        private Product product;
        private Integer quantity;
        private Double unitPrice;
        private Double subtotal;

        public OrderItemBuilder id(Long id) { this.id = id; return this; }
        public OrderItemBuilder order(Order order) { this.order = order; return this; }
        public OrderItemBuilder product(Product product) { this.product = product; return this; }
        public OrderItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public OrderItemBuilder unitPrice(Double unitPrice) { this.unitPrice = unitPrice; return this; }
        public OrderItemBuilder subtotal(Double subtotal) { this.subtotal = subtotal; return this; }

        public OrderItem build() {
            return new OrderItem(id, order, product, quantity, unitPrice, subtotal);
        }
    }
}
