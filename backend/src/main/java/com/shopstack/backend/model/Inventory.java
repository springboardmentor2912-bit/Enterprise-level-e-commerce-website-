package com.shopstack.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private int quantity; // Total physical quantity stored in the warehouse
    private int allocated; // Quantity reserved/allocated for orders but not yet packed/shipped
    private int damagedQuantity = 0; // Damaged and quarantined stock (strictly excluded from available main stock)
    private String binLocation = "BIN-GEN-01"; // Physical bin location, e.g. BIN-A1-04

    public Inventory() {}

    public Inventory(Warehouse warehouse, Product product, int quantity) {
        this.warehouse = warehouse;
        this.product = product;
        this.quantity = quantity;
        this.allocated = 0;
        this.damagedQuantity = 0;
        this.binLocation = "BIN-GEN-01";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getAllocated() { return allocated; }
    public void setAllocated(int allocated) { this.allocated = allocated; }

    public int getDamagedQuantity() { return damagedQuantity; }
    public void setDamagedQuantity(int damagedQuantity) { this.damagedQuantity = damagedQuantity; }

    public String getBinLocation() { return binLocation; }
    public void setBinLocation(String binLocation) { this.binLocation = binLocation; }

    // Convenience method to compute available stock (only uses sellable physical stock)
    public int getAvailableQuantity() {
        return Math.max(0, quantity - allocated);
    }
}
