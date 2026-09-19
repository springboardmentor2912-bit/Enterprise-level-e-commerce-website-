package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String trackingNumber;

    private String courierName;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    private LocalDateTime createdAt;

    public Shipment() {
    }

    @PrePersist
    public void prePersist() {

        createdAt = LocalDateTime.now();

        if (status == null) {
            status = ShipmentStatus.CREATED;
        }
    }

    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public String getCourierName() {
        return courierName;
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public LocalDateTime getShippedAt() {
        return shippedAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public void setCourierName(String courierName) {
        this.courierName = courierName;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public void setShippedAt(LocalDateTime shippedAt) {
        this.shippedAt = shippedAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}