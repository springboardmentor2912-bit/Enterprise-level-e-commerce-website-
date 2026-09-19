package com.shopstack.backend.entity;

import com.shopstack.backend.enums.WarehouseAllocationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="warehouse_allocations", uniqueConstraints=@UniqueConstraint(columnNames={"order_id"}))
public class WarehouseAllocation {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(optional=false) @JoinColumn(name="order_id") private Order order;
    @ManyToOne(optional=false) @JoinColumn(name="warehouse_id") private Warehouse warehouse;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private WarehouseAllocationStatus status;
    @ManyToOne @JoinColumn(name="assigned_staff_id") private User assignedStaff;
    @Column(nullable=false) private LocalDateTime allocatedAt;
    private LocalDateTime pickedAt;
    private LocalDateTime packedAt;
    private LocalDateTime readyAt;
    @OneToMany(mappedBy="allocation", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<WarehouseAllocationItem> items = new ArrayList<>();

    public WarehouseAllocation() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Order getOrder(){return order;} public void setOrder(Order order){this.order=order;}
    public Warehouse getWarehouse(){return warehouse;} public void setWarehouse(Warehouse warehouse){this.warehouse=warehouse;}
    public WarehouseAllocationStatus getStatus(){return status;} public void setStatus(WarehouseAllocationStatus status){this.status=status;}
    public User getAssignedStaff(){return assignedStaff;} public void setAssignedStaff(User assignedStaff){this.assignedStaff=assignedStaff;}
    public LocalDateTime getAllocatedAt(){return allocatedAt;} public void setAllocatedAt(LocalDateTime allocatedAt){this.allocatedAt=allocatedAt;}
    public LocalDateTime getPickedAt(){return pickedAt;} public void setPickedAt(LocalDateTime pickedAt){this.pickedAt=pickedAt;}
    public LocalDateTime getPackedAt(){return packedAt;} public void setPackedAt(LocalDateTime packedAt){this.packedAt=packedAt;}
    public LocalDateTime getReadyAt(){return readyAt;} public void setReadyAt(LocalDateTime readyAt){this.readyAt=readyAt;}
    public List<WarehouseAllocationItem> getItems(){return items;} public void setItems(List<WarehouseAllocationItem> items){this.items=items;}
}
