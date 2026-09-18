package com.shopstack.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_warehouse_allocations")
public class OrderWarehouseAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(nullable = false)
    private Integer allocatedQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockMovementStage stage = StockMovementStage.ALLOCATED;

    private String aisleLocation; // Snapshot of location for picker

    // Pick details
    private String pickerName;
    private LocalDateTime pickedAt;
    private String pickerNotes;

    // Pack details
    private String packerName;
    private LocalDateTime packedAt;
    private Double packageWeightKg;
    private String boxDimension; // e.g. "30x20x15 cm"
    private String boxType; // e.g. "Cardboard Carton B3"
    private String packingSlipNumber;

    // Shipment preparation details
    private String carrier; // e.g. "BlueDart Express", "Delhivery", "FedEx"
    private String trackingNumber;
    private LocalDateTime readyForShipmentAt;
    private LocalDateTime dispatchedAt;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderWarehouseAllocation() {}

    public OrderWarehouseAllocation(Long id, Order order, OrderItem orderItem, Warehouse warehouse,
                                    Integer allocatedQuantity, StockMovementStage stage, String aisleLocation,
                                    String pickerName, LocalDateTime pickedAt, String pickerNotes,
                                    String packerName, LocalDateTime packedAt, Double packageWeightKg,
                                    String boxDimension, String boxType, String packingSlipNumber,
                                    String carrier, String trackingNumber, LocalDateTime readyForShipmentAt,
                                    LocalDateTime dispatchedAt, String notes, LocalDateTime createdAt,
                                    LocalDateTime updatedAt) {
        this.id = id;
        this.order = order;
        this.orderItem = orderItem;
        this.warehouse = warehouse;
        this.allocatedQuantity = allocatedQuantity;
        this.stage = stage != null ? stage : StockMovementStage.ALLOCATED;
        this.aisleLocation = aisleLocation;
        this.pickerName = pickerName;
        this.pickedAt = pickedAt;
        this.pickerNotes = pickerNotes;
        this.packerName = packerName;
        this.packedAt = packedAt;
        this.packageWeightKg = packageWeightKg;
        this.boxDimension = boxDimension;
        this.boxType = boxType;
        this.packingSlipNumber = packingSlipNumber;
        this.carrier = carrier;
        this.trackingNumber = trackingNumber;
        this.readyForShipmentAt = readyForShipmentAt;
        this.dispatchedAt = dispatchedAt;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.stage == null) {
            this.stage = StockMovementStage.ALLOCATED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public OrderItem getOrderItem() { return orderItem; }
    public void setOrderItem(OrderItem orderItem) { this.orderItem = orderItem; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public Integer getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(Integer allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public StockMovementStage getStage() { return stage; }
    public void setStage(StockMovementStage stage) { this.stage = stage; }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public String getPickerName() { return pickerName; }
    public void setPickerName(String pickerName) { this.pickerName = pickerName; }

    public LocalDateTime getPickedAt() { return pickedAt; }
    public void setPickedAt(LocalDateTime pickedAt) { this.pickedAt = pickedAt; }

    public String getPickerNotes() { return pickerNotes; }
    public void setPickerNotes(String pickerNotes) { this.pickerNotes = pickerNotes; }

    public String getPackerName() { return packerName; }
    public void setPackerName(String packerName) { this.packerName = packerName; }

    public LocalDateTime getPackedAt() { return packedAt; }
    public void setPackedAt(LocalDateTime packedAt) { this.packedAt = packedAt; }

    public Double getPackageWeightKg() { return packageWeightKg; }
    public void setPackageWeightKg(Double packageWeightKg) { this.packageWeightKg = packageWeightKg; }

    public String getBoxDimension() { return boxDimension; }
    public void setBoxDimension(String boxDimension) { this.boxDimension = boxDimension; }

    public String getBoxType() { return boxType; }
    public void setBoxType(String boxType) { this.boxType = boxType; }

    public String getPackingSlipNumber() { return packingSlipNumber; }
    public void setPackingSlipNumber(String packingSlipNumber) { this.packingSlipNumber = packingSlipNumber; }

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public LocalDateTime getReadyForShipmentAt() { return readyForShipmentAt; }
    public void setReadyForShipmentAt(LocalDateTime readyForShipmentAt) { this.readyForShipmentAt = readyForShipmentAt; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static OrderWarehouseAllocationBuilder builder() {
        return new OrderWarehouseAllocationBuilder();
    }

    public static class OrderWarehouseAllocationBuilder {
        private Long id;
        private Order order;
        private OrderItem orderItem;
        private Warehouse warehouse;
        private Integer allocatedQuantity;
        private StockMovementStage stage = StockMovementStage.ALLOCATED;
        private String aisleLocation;
        private String pickerName;
        private LocalDateTime pickedAt;
        private String pickerNotes;
        private String packerName;
        private LocalDateTime packedAt;
        private Double packageWeightKg;
        private String boxDimension;
        private String boxType;
        private String packingSlipNumber;
        private String carrier;
        private String trackingNumber;
        private LocalDateTime readyForShipmentAt;
        private LocalDateTime dispatchedAt;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public OrderWarehouseAllocationBuilder id(Long id) { this.id = id; return this; }
        public OrderWarehouseAllocationBuilder order(Order order) { this.order = order; return this; }
        public OrderWarehouseAllocationBuilder orderItem(OrderItem orderItem) { this.orderItem = orderItem; return this; }
        public OrderWarehouseAllocationBuilder warehouse(Warehouse warehouse) { this.warehouse = warehouse; return this; }
        public OrderWarehouseAllocationBuilder allocatedQuantity(Integer allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; return this; }
        public OrderWarehouseAllocationBuilder stage(StockMovementStage stage) { this.stage = stage; return this; }
        public OrderWarehouseAllocationBuilder aisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; return this; }
        public OrderWarehouseAllocationBuilder pickerName(String pickerName) { this.pickerName = pickerName; return this; }
        public OrderWarehouseAllocationBuilder pickedAt(LocalDateTime pickedAt) { this.pickedAt = pickedAt; return this; }
        public OrderWarehouseAllocationBuilder pickerNotes(String pickerNotes) { this.pickerNotes = pickerNotes; return this; }
        public OrderWarehouseAllocationBuilder packerName(String packerName) { this.packerName = packerName; return this; }
        public OrderWarehouseAllocationBuilder packedAt(LocalDateTime packedAt) { this.packedAt = packedAt; return this; }
        public OrderWarehouseAllocationBuilder packageWeightKg(Double packageWeightKg) { this.packageWeightKg = packageWeightKg; return this; }
        public OrderWarehouseAllocationBuilder boxDimension(String boxDimension) { this.boxDimension = boxDimension; return this; }
        public OrderWarehouseAllocationBuilder boxType(String boxType) { this.boxType = boxType; return this; }
        public OrderWarehouseAllocationBuilder packingSlipNumber(String packingSlipNumber) { this.packingSlipNumber = packingSlipNumber; return this; }
        public OrderWarehouseAllocationBuilder carrier(String carrier) { this.carrier = carrier; return this; }
        public OrderWarehouseAllocationBuilder trackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; return this; }
        public OrderWarehouseAllocationBuilder readyForShipmentAt(LocalDateTime readyForShipmentAt) { this.readyForShipmentAt = readyForShipmentAt; return this; }
        public OrderWarehouseAllocationBuilder dispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; return this; }
        public OrderWarehouseAllocationBuilder notes(String notes) { this.notes = notes; return this; }
        public OrderWarehouseAllocationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public OrderWarehouseAllocationBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public OrderWarehouseAllocation build() {
            return new OrderWarehouseAllocation(id, order, orderItem, warehouse, allocatedQuantity, stage, aisleLocation,
                    pickerName, pickedAt, pickerNotes, packerName, packedAt, packageWeightKg, boxDimension, boxType,
                    packingSlipNumber, carrier, trackingNumber, readyForShipmentAt, dispatchedAt, notes, createdAt, updatedAt);
        }
    }
}
