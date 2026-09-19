package com.shopstack.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name="warehouse_allocation_items")
public class WarehouseAllocationItem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="allocation_id") private WarehouseAllocation allocation;
    @ManyToOne(optional=false) @JoinColumn(name="product_id") private Product product;
    @Column(nullable=false) private Integer quantity;
    @Column(nullable=false) private Integer pickedQuantity = 0;

    public WarehouseAllocationItem() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public WarehouseAllocation getAllocation(){return allocation;} public void setAllocation(WarehouseAllocation allocation){this.allocation=allocation;}
    public Product getProduct(){return product;} public void setProduct(Product product){this.product=product;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer quantity){this.quantity=quantity;}
    public Integer getPickedQuantity(){return pickedQuantity;} public void setPickedQuantity(Integer pickedQuantity){this.pickedQuantity=pickedQuantity;}
}
