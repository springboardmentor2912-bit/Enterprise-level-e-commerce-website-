package com.infosys.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_inventory",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
    })
public class WarehouseInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_sku")
    private String productSku;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "reorder_threshold")
    private Integer reorderThreshold = 10;

    @Column(name = "aisle_bin_location")
    private String aisleBinLocation; // e.g. "Aisle-3-Shelf-B-Bin-12"

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now();
    }

    public WarehouseInventory() {}

    public WarehouseInventory(Long warehouseId, Long productId, String productName, String productSku, Integer availableQuantity, Integer reservedQuantity, String aisleBinLocation) {
        this.warehouseId = warehouseId;
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.availableQuantity = availableQuantity != null ? availableQuantity : 0;
        this.reservedQuantity = reservedQuantity != null ? reservedQuantity : 0;
        this.aisleBinLocation = aisleBinLocation;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public Integer getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }

    public Integer getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(Integer reservedQuantity) { this.reservedQuantity = reservedQuantity; }

    public Integer getEffectiveStock() {
        return Math.max(0, (availableQuantity != null ? availableQuantity : 0) - (reservedQuantity != null ? reservedQuantity : 0));
    }

    public Integer getReorderThreshold() { return reorderThreshold; }
    public void setReorderThreshold(Integer reorderThreshold) { this.reorderThreshold = reorderThreshold; }

    public String getAisleBinLocation() { return aisleBinLocation; }
    public void setAisleBinLocation(String aisleBinLocation) { this.aisleBinLocation = aisleBinLocation; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}
