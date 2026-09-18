package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod = PaymentMethod.CARD;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(columnDefinition = "TEXT")
    private String orderIdsJson; // Comma-separated or JSON of internal order IDs

    private String failureReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Payment() {}

    public Payment(Long id, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature, Double amount, String currency, PaymentStatus status, PaymentMethod paymentMethod, User customer, String orderIdsJson, String failureReason, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.status = status != null ? status : PaymentStatus.PENDING;
        this.paymentMethod = paymentMethod != null ? paymentMethod : PaymentMethod.CARD;
        this.customer = customer;
        this.orderIdsJson = orderIdsJson;
        this.failureReason = failureReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public String getOrderIdsJson() { return orderIdsJson; }
    public void setOrderIdsJson(String orderIdsJson) { this.orderIdsJson = orderIdsJson; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static PaymentBuilder builder() {
        return new PaymentBuilder();
    }

    public static class PaymentBuilder {
        private Long id;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        private Double amount;
        private String currency = "INR";
        private PaymentStatus status = PaymentStatus.PENDING;
        private PaymentMethod paymentMethod = PaymentMethod.CARD;
        private User customer;
        private String orderIdsJson;
        private String failureReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PaymentBuilder id(Long id) { this.id = id; return this; }
        public PaymentBuilder razorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; return this; }
        public PaymentBuilder razorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; return this; }
        public PaymentBuilder razorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; return this; }
        public PaymentBuilder amount(Double amount) { this.amount = amount; return this; }
        public PaymentBuilder currency(String currency) { this.currency = currency; return this; }
        public PaymentBuilder status(PaymentStatus status) { this.status = status; return this; }
        public PaymentBuilder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public PaymentBuilder customer(User customer) { this.customer = customer; return this; }
        public PaymentBuilder orderIdsJson(String orderIdsJson) { this.orderIdsJson = orderIdsJson; return this; }
        public PaymentBuilder failureReason(String failureReason) { this.failureReason = failureReason; return this; }
        public PaymentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PaymentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Payment build() {
            return new Payment(id, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency, status, paymentMethod, customer, orderIdsJson, failureReason, createdAt, updatedAt);
        }
    }
}
