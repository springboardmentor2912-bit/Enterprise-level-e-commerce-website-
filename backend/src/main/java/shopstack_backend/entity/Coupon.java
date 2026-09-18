package shopstack_backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Always stored trimmed + uppercase so lookups are consistent
    // regardless of how the admin or customer typed it.
    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    // For PERCENTAGE: a number 0-100 (e.g. 20 means 20%).
    // For FLAT: a flat rupee amount to knock off the order.
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    // Order must be at least this much (subtotal, before discount) for the
    // coupon to be usable. Null = no minimum.
    @Column(precision = 12, scale = 2)
    private BigDecimal minOrderAmount;

    // Caps how much a PERCENTAGE coupon can discount in absolute rupees.
    // Ignored for FLAT coupons. Null = no cap.
    @Column(precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate expiryDate;

    // Total number of times this coupon may be used, across all customers.
    // Null = unlimited.
    private Integer usageLimit;

    // How many times a SINGLE customer may use this coupon (e.g. "one per
    // customer" welcome codes). Null = no per-customer cap, only the
    // global usageLimit above applies.
    private Integer perCustomerLimit;

    // How many times it HAS been used so far. Incremented atomically
    // whenever a customer's order successfully applies the coupon.
    @Column(nullable = false)
    private int usageCount = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Coupon() {
    }

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public BigDecimal getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(BigDecimal maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getPerCustomerLimit() {
        return perCustomerLimit;
    }

    public void setPerCustomerLimit(Integer perCustomerLimit) {
        this.perCustomerLimit = perCustomerLimit;
    }

    public int getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(int usageCount) {
        this.usageCount = usageCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}