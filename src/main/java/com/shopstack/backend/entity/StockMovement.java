package com.shopstack.backend.entity;

import com.shopstack.backend.enums.StockMovementType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="stock_movements")
public class StockMovement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="warehouse_id") private Warehouse warehouse;
    @ManyToOne(optional=false) @JoinColumn(name="product_id") private Product product;
    @ManyToOne @JoinColumn(name="order_id") private Order order;
    @ManyToOne @JoinColumn(name="staff_id") private User staff;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private StockMovementType type;
    @Column(nullable=false) private Integer quantity;
    @Column(nullable=false) private LocalDateTime createdAt;

    public StockMovement() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Warehouse getWarehouse(){return warehouse;} public void setWarehouse(Warehouse warehouse){this.warehouse=warehouse;}
    public Product getProduct(){return product;} public void setProduct(Product product){this.product=product;}
    public Order getOrder(){return order;} public void setOrder(Order order){this.order=order;}
    public User getStaff(){return staff;} public void setStaff(User staff){this.staff=staff;}
    public StockMovementType getType(){return type;} public void setType(StockMovementType type){this.type=type;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer quantity){this.quantity=quantity;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}
}
