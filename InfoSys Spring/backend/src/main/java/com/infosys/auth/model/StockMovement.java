package com.infosys.auth.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "warehouse_id", nullable = false)
    private Long warehouseId;

    @Column(name = "warehouse_name")
    private String warehouseName;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "quantity_change", nullable = false)
    private Integer quantityChange; // + for inward/restock, - for pick/ship

    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false)
    private MovementType movementType;

    @Column(name = "performed_by_staff_id")
    private Long performedByStaffId;

    @Column(name = "performed_by_staff_name")
    private String performedByStaffName;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(length = 500)
    private String note;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum MovementType {
        INWARD_STOCK,
        ALLOCATED,
        PICKED,
        PACKED,
        SHIPPED,
        RETURN_RESTOCK,
        CANCELLED_RESTOCK,
        MANUAL_ADJUSTMENT
    }

    public StockMovement() {}

    public StockMovement(Long warehouseId, String warehouseName, Long productId, String productName, Long orderId, Integer quantityChange, MovementType movementType, Long performedByStaffId, String performedByStaffName, String note) {
        this.warehouseId = warehouseId;
        this.warehouseName = warehouseName;
        this.productId = productId;
        this.productName = productName;
        this.orderId = orderId;
        this.quantityChange = quantityChange;
        this.movementType = movementType;
        this.performedByStaffId = performedByStaffId;
        this.performedByStaffName = performedByStaffName;
        this.note = note;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public MovementType getMovementType() { return movementType; }
    public void setMovementType(MovementType movementType) { this.movementType = movementType; }

    public Long getPerformedByStaffId() { return performedByStaffId; }
    public void setPerformedByStaffId(Long performedByStaffId) { this.performedByStaffId = performedByStaffId; }

    public String getPerformedByStaffName() { return performedByStaffName; }
    public void setPerformedByStaffName(String performedByStaffName) { this.performedByStaffName = performedByStaffName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
