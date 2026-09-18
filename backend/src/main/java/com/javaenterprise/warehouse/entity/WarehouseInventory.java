package com.javaenterprise.warehouse.entity;

import com.javaenterprise.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_inventory", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "warehouse_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WarehouseInventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Builder.Default
    private Integer totalStock = 0;      // Total physical stock

    @Builder.Default
    private Integer allocatedStock = 0;  // Stock reserved for orders, not yet shipped

    public Integer getAvailableStock() {
        return totalStock - allocatedStock;
    }
}