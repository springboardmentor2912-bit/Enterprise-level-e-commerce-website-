package com.shopstack.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Builder.Default
    private Integer stockQuantity = 0;

    @Builder.Default
    private Integer reservedQuantity = 0; // reserved for orders in progress

    @Builder.Default
    private Integer lowStockThreshold = 10;

    private String warehouseLocation;

    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.lastUpdated = LocalDateTime.now();
    }

    @Transient
    public int getAvailableQuantity() {
        return stockQuantity - reservedQuantity;
    }

    @Transient
    public boolean isLowStock() {
        return getAvailableQuantity() <= lowStockThreshold;
    }
}
