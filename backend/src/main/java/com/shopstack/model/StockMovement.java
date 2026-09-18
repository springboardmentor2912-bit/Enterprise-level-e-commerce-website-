package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementType movementType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementStage stage;

    @Column(nullable = false)
    private Integer quantity;

    private Integer previousAvailableStock;
    private Integer newAvailableStock;

    private Integer previousAllocatedStock;
    private Integer newAllocatedStock;

    private Integer previousTotalStock;
    private Integer newTotalStock;

    private String referenceNumber; // e.g. ORD-10294 or RESTOCK-8821

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String performedBy; // User or System Worker

    private LocalDateTime createdAt;

    public StockMovement() {}

    public StockMovement(Long id, Warehouse warehouse, Product product, Order order, OrderItem orderItem,
                         StockMovementType movementType, StockMovementStage stage, Integer quantity,
                         Integer previousAvailableStock, Integer newAvailableStock,
                         Integer previousAllocatedStock, Integer newAllocatedStock,
                         Integer previousTotalStock, Integer newTotalStock,
                         String referenceNumber, String notes, String performedBy, LocalDateTime createdAt) {
        this.id = id;
        this.warehouse = warehouse;
        this.product = product;
        this.order = order;
        this.orderItem = orderItem;
        this.movementType = movementType;
        this.stage = stage;
        this.quantity = quantity;
        this.previousAvailableStock = previousAvailableStock;
        this.newAvailableStock = newAvailableStock;
        this.previousAllocatedStock = previousAllocatedStock;
        this.newAllocatedStock = newAllocatedStock;
        this.previousTotalStock = previousTotalStock;
        this.newTotalStock = newTotalStock;
        this.referenceNumber = referenceNumber;
        this.notes = notes;
        this.performedBy = performedBy;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }

    public StockMovementType getMovementType() { return movementType; }
    public void setMovementType(StockMovementType movementType) { this.movementType = movementType; }

    public StockMovementStage getStage() { return stage; }
    public void setStage(StockMovementStage stage) { this.stage = stage; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousAvailableStock() { return previousAvailableStock; }
    public void setPreviousAvailableStock(Integer previousAvailableStock) { this.previousAvailableStock = previousAvailableStock; }

    public Integer getNewAvailableStock() { return newAvailableStock; }
    public void setNewAvailableStock(Integer newAvailableStock) { this.newAvailableStock = newAvailableStock; }

    public Integer getPreviousAllocatedStock() { return previousAllocatedStock; }
    public void setPreviousAllocatedStock(Integer previousAllocatedStock) { this.previousAllocatedStock = previousAllocatedStock; }

    public Integer getNewAllocatedStock() { return newAllocatedStock; }
    public void setNewAllocatedStock(Integer newAllocatedStock) { this.newAllocatedStock = newAllocatedStock; }

    public Integer getPreviousTotalStock() { return previousTotalStock; }
    public void setPreviousTotalStock(Integer previousTotalStock) { this.previousTotalStock = previousTotalStock; }

    public Integer getNewTotalStock() { return newTotalStock; }
    public void setNewTotalStock(Integer newTotalStock) { this.newTotalStock = newTotalStock; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static StockMovementBuilder builder() {
        return new StockMovementBuilder();
    }

    public static class StockMovementBuilder {
        private Long id;
        private Warehouse warehouse;
        private Product product;
        private Order order;
        private OrderItem orderItem;
        private StockMovementType movementType;
        private StockMovementStage stage;
        private Integer quantity;
        private Integer previousAvailableStock;
        private Integer newAvailableStock;
        private Integer previousAllocatedStock;
        private Integer newAllocatedStock;
        private Integer previousTotalStock;
        private Integer newTotalStock;
        private String referenceNumber;
        private String notes;
        private String performedBy;
        private LocalDateTime createdAt;

        public StockMovementBuilder id(Long id) { this.id = id; return this; }
        public StockMovementBuilder warehouse(Warehouse warehouse) { this.warehouse = warehouse; return this; }
        public StockMovementBuilder product(Product product) { this.product = product; return this; }
        public StockMovementBuilder order(Order order) { this.order = order; return this; }
        public StockMovementBuilder orderItem(OrderItem orderItem) { this.orderItem = orderItem; return this; }
        public StockMovementBuilder movementType(StockMovementType movementType) { this.movementType = movementType; return this; }
        public StockMovementBuilder stage(StockMovementStage stage) { this.stage = stage; return this; }
        public StockMovementBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public StockMovementBuilder previousAvailableStock(Integer previousAvailableStock) { this.previousAvailableStock = previousAvailableStock; return this; }
        public StockMovementBuilder newAvailableStock(Integer newAvailableStock) { this.newAvailableStock = newAvailableStock; return this; }
        public StockMovementBuilder previousAllocatedStock(Integer previousAllocatedStock) { this.previousAllocatedStock = previousAllocatedStock; return this; }
        public StockMovementBuilder newAllocatedStock(Integer newAllocatedStock) { this.newAllocatedStock = newAllocatedStock; return this; }
        public StockMovementBuilder previousTotalStock(Integer previousTotalStock) { this.previousTotalStock = previousTotalStock; return this; }
        public StockMovementBuilder newTotalStock(Integer newTotalStock) { this.newTotalStock = newTotalStock; return this; }
        public StockMovementBuilder referenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; return this; }
        public StockMovementBuilder notes(String notes) { this.notes = notes; return this; }
        public StockMovementBuilder performedBy(String performedBy) { this.performedBy = performedBy; return this; }
        public StockMovementBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public StockMovement build() {
            return new StockMovement(id, warehouse, product, order, orderItem, movementType, stage, quantity,
                    previousAvailableStock, newAvailableStock, previousAllocatedStock, newAllocatedStock,
                    previousTotalStock, newTotalStock, referenceNumber, notes, performedBy, createdAt);
        }
    }
}
