package com.shopstack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "warehouse_inventory", uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "product_id"}))
public class WarehouseInventory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="warehouse_id") private Warehouse warehouse;
    @ManyToOne(optional=false) @JoinColumn(name="product_id") private Product product;
    @Column(nullable=false) private Integer quantity = 0;
    @Column(nullable=false) private Integer reservedQuantity = 0;

    public WarehouseInventory() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Warehouse getWarehouse(){return warehouse;} public void setWarehouse(Warehouse warehouse){this.warehouse=warehouse;}
    public Product getProduct(){return product;} public void setProduct(Product product){this.product=product;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer quantity){this.quantity=quantity;}
    public Integer getReservedQuantity(){return reservedQuantity;} public void setReservedQuantity(Integer reservedQuantity){this.reservedQuantity=reservedQuantity;}
    @Transient public int getAvailableQuantity(){return Math.max(0, (quantity==null?0:quantity)-(reservedQuantity==null?0:reservedQuantity));}
}
