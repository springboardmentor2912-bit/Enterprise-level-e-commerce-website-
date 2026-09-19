package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "warehouse_allocations")
public class WarehouseAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Enumerated(EnumType.STRING)
    private WarehouseStatus status;

    private LocalDateTime allocatedAt;

    private LocalDateTime updatedAt;

    public WarehouseAllocation() {
    }

    @PrePersist
    public void prePersist() {

        allocatedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = WarehouseStatus.ALLOCATED;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public WarehouseStatus getStatus() {
        return status;
    }

    public LocalDateTime getAllocatedAt() {
        return allocatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public void setStatus(WarehouseStatus status) {
        this.status = status;
    }

    public void setAllocatedAt(LocalDateTime allocatedAt) {
        this.allocatedAt = allocatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}