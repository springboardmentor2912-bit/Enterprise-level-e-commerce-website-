package com.shopstack.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendorProfile;

    @Column(nullable = false)
    private Double totalAmount;

    private Double subtotalAmount;

    private Double discountAmount = 0.0;

    private String couponCode;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.CONFIRMED;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod = PaymentMethod.CARD;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<OrderWarehouseAllocation> warehouseAllocations = new ArrayList<>();

    private LocalDateTime createdAt;

    public Order() {}

    public Order(Long id, String orderNumber, User customer, VendorProfile vendorProfile, Double totalAmount,
                 Double subtotalAmount, Double discountAmount, String couponCode,
                 OrderStatus status, String shippingAddress, List<OrderItem> items, LocalDateTime createdAt) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.customer = customer;
        this.vendorProfile = vendorProfile;
        this.totalAmount = totalAmount;
        this.subtotalAmount = subtotalAmount != null ? subtotalAmount : totalAmount;
        this.discountAmount = discountAmount != null ? discountAmount : 0.0;
        this.couponCode = couponCode;
        this.status = status != null ? status : OrderStatus.CONFIRMED;
        this.shippingAddress = shippingAddress;
        if (items != null) {
            this.items = new ArrayList<>(items);
        }
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.discountAmount == null) {
            this.discountAmount = 0.0;
        }
        if (this.subtotalAmount == null) {
            this.subtotalAmount = this.totalAmount;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public VendorProfile getVendorProfile() { return vendorProfile; }
    public void setVendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getSubtotalAmount() { return subtotalAmount; }
    public void setSubtotalAmount(Double subtotalAmount) { this.subtotalAmount = subtotalAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items != null ? new ArrayList<>(items) : new ArrayList<>(); }

    public List<OrderWarehouseAllocation> getWarehouseAllocations() { return warehouseAllocations; }
    public void setWarehouseAllocations(List<OrderWarehouseAllocation> warehouseAllocations) { this.warehouseAllocations = warehouseAllocations != null ? new ArrayList<>(warehouseAllocations) : new ArrayList<>(); }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    public static class OrderBuilder {
        private Long id;
        private String orderNumber;
        private User customer;
        private VendorProfile vendorProfile;
        private Double totalAmount;
        private Double subtotalAmount;
        private Double discountAmount = 0.0;
        private String couponCode;
        private OrderStatus status = OrderStatus.CONFIRMED;
        private String shippingAddress;
        private List<OrderItem> items = new ArrayList<>();
        private LocalDateTime createdAt;

        public OrderBuilder id(Long id) { this.id = id; return this; }
        public OrderBuilder orderNumber(String orderNumber) { this.orderNumber = orderNumber; return this; }
        public OrderBuilder customer(User customer) { this.customer = customer; return this; }
        public OrderBuilder vendorProfile(VendorProfile vendorProfile) { this.vendorProfile = vendorProfile; return this; }
        public OrderBuilder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public OrderBuilder subtotalAmount(Double subtotalAmount) { this.subtotalAmount = subtotalAmount; return this; }
        public OrderBuilder discountAmount(Double discountAmount) { this.discountAmount = discountAmount; return this; }
        public OrderBuilder couponCode(String couponCode) { this.couponCode = couponCode; return this; }
        public OrderBuilder status(OrderStatus status) { this.status = status; return this; }
        public OrderBuilder shippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; return this; }
        public OrderBuilder items(List<OrderItem> items) { this.items = items; return this; }
        public OrderBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Order build() {
            return new Order(id, orderNumber, customer, vendorProfile, totalAmount, subtotalAmount, discountAmount, couponCode, status, shippingAddress, items, createdAt);
        }
    }
}
