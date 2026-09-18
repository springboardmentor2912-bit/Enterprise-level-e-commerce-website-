package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_inventory", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
})
public class WarehouseInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer totalStock = 0; // Physical units physically in warehouse

    @Column(nullable = false)
    private Integer allocatedStock = 0; // Units reserved for active un-shipped orders

    @Column(nullable = false)
    private Integer availableStock = 0; // totalStock - allocatedStock

    @Column(nullable = false)
    private Integer damagedStock = 0; // Quarantine / Damaged units from QC returns

    private String aisleLocation; // e.g. "Aisle 4, Bay B, Shelf 12"

    private Integer minThreshold = 10; // Low stock alert trigger level

    private LocalDateTime lastRestockedAt;

    private LocalDateTime updatedAt;

    public WarehouseInventory() {}

    public WarehouseInventory(Long id, Warehouse warehouse, Product product, Integer totalStock,
                              Integer allocatedStock, Integer availableStock, Integer damagedStock,
                              String aisleLocation, Integer minThreshold, LocalDateTime lastRestockedAt, LocalDateTime updatedAt) {
        this.id = id;
        this.warehouse = warehouse;
        this.product = product;
        this.totalStock = totalStock != null ? totalStock : 0;
        this.allocatedStock = allocatedStock != null ? allocatedStock : 0;
        this.availableStock = availableStock != null ? availableStock : (this.totalStock - this.allocatedStock);
        this.damagedStock = damagedStock != null ? damagedStock : 0;
        this.aisleLocation = aisleLocation;
        this.minThreshold = minThreshold != null ? minThreshold : 10;
        this.lastRestockedAt = lastRestockedAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    protected void updateAvailability() {
        if (this.totalStock == null) this.totalStock = 0;
        if (this.allocatedStock == null) this.allocatedStock = 0;
        if (this.minThreshold == null) this.minThreshold = 10;
        this.availableStock = Math.max(0, this.totalStock - this.allocatedStock);
        this.updatedAt = LocalDateTime.now();
    }

    public boolean hasSufficientStock(int quantity) {
        return getAvailableStock() >= quantity;
    }

    public void allocate(int quantity) {
        if (!hasSufficientStock(quantity)) {
            throw new IllegalStateException("Insufficient available stock in warehouse " +
                    (warehouse != null ? warehouse.getName() : "") + ". Requested: " + quantity + ", Available: " + getAvailableStock());
        }
        this.allocatedStock += quantity;
        this.availableStock = Math.max(0, this.totalStock - this.allocatedStock);
        this.updatedAt = LocalDateTime.now();
    }

    public void deallocate(int quantity) {
        this.allocatedStock = Math.max(0, this.allocatedStock - quantity);
        this.availableStock = Math.max(0, this.totalStock - this.allocatedStock);
        this.updatedAt = LocalDateTime.now();
    }

    public void completeDeduction(int quantity) {
        this.totalStock = Math.max(0, this.totalStock - quantity);
        this.allocatedStock = Math.max(0, this.allocatedStock - quantity);
        this.availableStock = Math.max(0, this.totalStock - this.allocatedStock);
        this.updatedAt = LocalDateTime.now();
    }

    public void restock(int quantity) {
        this.totalStock += quantity;
        this.availableStock = Math.max(0, this.totalStock - this.allocatedStock);
        this.lastRestockedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getTotalStock() { return totalStock; }
    public void setTotalStock(Integer totalStock) {
        this.totalStock = totalStock;
        updateAvailability();
    }

    public Integer getAllocatedStock() { return allocatedStock; }
    public void setAllocatedStock(Integer allocatedStock) {
        this.allocatedStock = allocatedStock;
        updateAvailability();
    }

    public Integer getAvailableStock() { return availableStock; }
    public void setAvailableStock(Integer availableStock) { this.availableStock = availableStock; }

    public Integer getDamagedStock() { return damagedStock != null ? damagedStock : 0; }
    public void setDamagedStock(Integer damagedStock) { this.damagedStock = damagedStock != null ? damagedStock : 0; }

    public void moveToDamagedStock(int quantity) {
        if (this.damagedStock == null) this.damagedStock = 0;
        this.damagedStock += quantity;
        this.updatedAt = LocalDateTime.now();
    }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public Integer getMinThreshold() { return minThreshold; }
    public void setMinThreshold(Integer minThreshold) { this.minThreshold = minThreshold; }

    public LocalDateTime getLastRestockedAt() { return lastRestockedAt; }
    public void setLastRestockedAt(LocalDateTime lastRestockedAt) { this.lastRestockedAt = lastRestockedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static WarehouseInventoryBuilder builder() {
        return new WarehouseInventoryBuilder();
    }

    public static class WarehouseInventoryBuilder {
        private Long id;
        private Warehouse warehouse;
        private Product product;
        private Integer totalStock = 0;
        private Integer allocatedStock = 0;
        private Integer availableStock = 0;
        private Integer damagedStock = 0;
        private String aisleLocation;
        private Integer minThreshold = 10;
        private LocalDateTime lastRestockedAt;
        private LocalDateTime updatedAt;

        public WarehouseInventoryBuilder id(Long id) { this.id = id; return this; }
        public WarehouseInventoryBuilder warehouse(Warehouse warehouse) { this.warehouse = warehouse; return this; }
        public WarehouseInventoryBuilder product(Product product) { this.product = product; return this; }
        public WarehouseInventoryBuilder totalStock(Integer totalStock) { this.totalStock = totalStock; return this; }
        public WarehouseInventoryBuilder allocatedStock(Integer allocatedStock) { this.allocatedStock = allocatedStock; return this; }
        public WarehouseInventoryBuilder availableStock(Integer availableStock) { this.availableStock = availableStock; return this; }
        public WarehouseInventoryBuilder damagedStock(Integer damagedStock) { this.damagedStock = damagedStock; return this; }
        public WarehouseInventoryBuilder aisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; return this; }
        public WarehouseInventoryBuilder minThreshold(Integer minThreshold) { this.minThreshold = minThreshold; return this; }
        public WarehouseInventoryBuilder lastRestockedAt(LocalDateTime lastRestockedAt) { this.lastRestockedAt = lastRestockedAt; return this; }
        public WarehouseInventoryBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public WarehouseInventory build() {
            return new WarehouseInventory(id, warehouse, product, totalStock, allocatedStock, availableStock, damagedStock, aisleLocation, minThreshold, lastRestockedAt, updatedAt);
        }
    }
}
