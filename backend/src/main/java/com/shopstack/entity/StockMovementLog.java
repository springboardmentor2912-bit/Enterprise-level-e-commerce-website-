package com.shopstack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movement_logs")
public class StockMovementLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementStage stage;

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(nullable = false)
    private Integer quantity;

    @Column(length = 1000)
    private String notes;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    public StockMovementLog() {
    }

    public StockMovementLog(Product product, Warehouse warehouse, Order order, StockMovementStage stage, Integer quantity, String notes) {
        this.product = product;
        this.warehouse = warehouse;
        this.order = order;
        this.stage = stage;
        this.newStatus = stage != null ? stage.name() : null;
        this.quantity = quantity;
        this.notes = notes;
    }

    public StockMovementLog(Product product, Warehouse warehouse, Order order, String previousStatus, String newStatus, StockMovementStage stage, Integer quantity, String notes) {
        this.product = product;
        this.warehouse = warehouse;
        this.order = order;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.stage = stage;
        this.quantity = quantity;
        this.notes = notes;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public StockMovementStage getStage() {
        return stage;
    }

    public void setStage(StockMovementStage stage) {
        this.stage = stage;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
