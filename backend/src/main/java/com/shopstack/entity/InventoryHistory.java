package com.shopstack.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_history")
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange;

    @Column(name = "resulting_stock", nullable = false)
    private Integer resultingStock;

    @Column(name = "change_reason", nullable = false)
    private String changeReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public InventoryHistory() {
    }

    public InventoryHistory(Product product, Integer quantityChange, Integer resultingStock, String changeReason) {
        this.product = product;
        this.quantityChange = quantityChange;
        this.resultingStock = resultingStock;
        this.changeReason = changeReason;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
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

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public Integer getResultingStock() {
        return resultingStock;
    }

    public void setResultingStock(Integer resultingStock) {
        this.resultingStock = resultingStock;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public void setChangeReason(String changeReason) {
        this.changeReason = changeReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
