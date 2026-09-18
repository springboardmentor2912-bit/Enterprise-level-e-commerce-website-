package com.shopstack.dto;

import com.shopstack.entity.Shipment;
import com.shopstack.entity.ShipmentStatus;

import java.time.LocalDateTime;

public class ShipmentDTO {
    private Long id;
    private Long orderId;
    private String customerName;
    private String customerEmail;
    private String shippingAddress;
    private String trackingId;
    private String carrier;
    private ShipmentStatus status;
    private String currentLocation;
    private String trackingNotes;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ShipmentDTO() {
    }

    public ShipmentDTO(Shipment shipment) {
        if (shipment != null) {
            this.id = shipment.getId();
            if (shipment.getOrder() != null) {
                this.orderId = shipment.getOrder().getId();
                this.shippingAddress = shipment.getOrder().getShippingAddress();
                if (shipment.getOrder().getCustomer() != null) {
                    this.customerName = shipment.getOrder().getCustomer().getName();
                    this.customerEmail = shipment.getOrder().getCustomer().getEmail();
                }
            }
            this.trackingId = shipment.getTrackingId();
            this.carrier = shipment.getCarrier();
            this.status = shipment.getStatus();
            this.currentLocation = shipment.getCurrentLocation();
            this.trackingNotes = shipment.getTrackingNotes();
            this.shippedAt = shipment.getShippedAt();
            this.deliveredAt = shipment.getDeliveredAt();
            this.createdAt = shipment.getCreatedAt();
            this.updatedAt = shipment.getUpdatedAt();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }

    public String getTrackingNotes() { return trackingNotes; }
    public void setTrackingNotes(String trackingNotes) { this.trackingNotes = trackingNotes; }

    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
