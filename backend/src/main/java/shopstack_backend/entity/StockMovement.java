package shopstack_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * An append-only log of every stock-stage transition at a warehouse:
 * stock being received (fromStage null -> "AVAILABLE"), allocated, picked,
 * packed, marked ready for shipment, or an allocation being cancelled.
 * This is what "Stock Movement Tracking" (requirement 6) surfaces.
 */
@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Null for a raw stock receipt (nothing to do with a specific order yet)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;

    private String fromStage; // nullable — null for the very first "stock received" movement
    @Column(nullable = false)
    private String toStage;

    @Column(nullable = false)
    private int quantity;

    private String note;

    @Column(nullable = false)
    private LocalDateTime movedAt;

    public StockMovement() {
    }

    @PrePersist
    public void onCreate() {
        if (movedAt == null) {
            movedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Warehouse getWarehouse() {
        return warehouse;
    }

    public void setWarehouse(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public OrderItem getOrderItem() {
        return orderItem;
    }

    public void setOrderItem(OrderItem orderItem) {
        this.orderItem = orderItem;
    }

    public String getFromStage() {
        return fromStage;
    }

    public void setFromStage(String fromStage) {
        this.fromStage = fromStage;
    }

    public String getToStage() {
        return toStage;
    }

    public void setToStage(String toStage) {
        this.toStage = toStage;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getMovedAt() {
        return movedAt;
    }

    public void setMovedAt(LocalDateTime movedAt) {
        this.movedAt = movedAt;
    }
}