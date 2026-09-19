package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String warehouseName;

    private String location;

    private Integer capacity;

    private Integer currentStock;

    private LocalDateTime createdAt;

    public Warehouse() {
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();

        if (currentStock == null) {
            currentStock = 0;
        }
    }

    public Long getId() {
        return id;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public String getLocation() {
        return location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public Integer getCurrentStock() {
        return currentStock;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}