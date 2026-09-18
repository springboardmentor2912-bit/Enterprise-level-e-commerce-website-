package shopstack_backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * A commission record represents the platform's cut (and the vendor's
 * remaining share) for ONE vendor's portion of ONE order.
 *
 * An order can contain products from multiple vendors, so commission is
 * calculated and stored per (order, vendor) pair rather than per order —
 * this is what lets a single multi-vendor order correctly split commission
 * across every vendor involved.
 */
@Entity
@Table(
        name = "commissions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"order_id", "vendor_id"})
)
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    // Sum of this vendor's (non-cancelled) line items within the order
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saleAmount;

    // The rate actually applied, frozen at the time this record was created
    // (so a later change to the platform default or vendor rate never
    // silently rewrites historical commission records)
    @Column(nullable = false)
    private Double commissionRate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal commissionAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal vendorAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommissionStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Commission() {
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (status == null) {
            status = CommissionStatus.CONFIRMED;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public BigDecimal getSaleAmount() {
        return saleAmount;
    }

    public void setSaleAmount(BigDecimal saleAmount) {
        this.saleAmount = saleAmount;
    }

    public Double getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(Double commissionRate) {
        this.commissionRate = commissionRate;
    }

    public BigDecimal getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(BigDecimal commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public BigDecimal getVendorAmount() {
        return vendorAmount;
    }

    public void setVendorAmount(BigDecimal vendorAmount) {
        this.vendorAmount = vendorAmount;
    }

    public CommissionStatus getStatus() {
        return status;
    }

    public void setStatus(CommissionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}