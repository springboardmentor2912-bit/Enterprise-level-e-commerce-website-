package shopstack_backend.entity;

import jakarta.persistence.*;

/**
 * How much of a given product physically sits at a given warehouse, split
 * into what's free to allocate (availableQuantity) and what's already
 * promised to a confirmed order but hasn't shipped yet (allocatedQuantity).
 *
 * This is deliberately separate from Product.stockQuantity, which remains
 * the platform-wide total used at checkout time to gate "can this be
 * ordered at all". WarehouseService keeps the two in sync when stock is
 * received: receiving stock into a warehouse also bumps the product's
 * global stockQuantity by the same amount.
 */
@Entity
@Table(
        name = "warehouse_stocks",
        uniqueConstraints = @UniqueConstraint(columnNames = {"warehouse_id", "product_id"})
)
public class WarehouseStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int availableQuantity = 0;

    @Column(nullable = false)
    private int allocatedQuantity = 0;

    // Stock that failed return QC — quarantined, not resellable, and
    // excluded from availableQuantity/allocation entirely.
    @Column(nullable = false)
    private int damagedQuantity = 0;

    public WarehouseStock() {
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

    public int getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(int availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public int getAllocatedQuantity() {
        return allocatedQuantity;
    }

    public void setAllocatedQuantity(int allocatedQuantity) {
        this.allocatedQuantity = allocatedQuantity;
    }

    public int getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(int damagedQuantity) {
        this.damagedQuantity = damagedQuantity;
    }
}