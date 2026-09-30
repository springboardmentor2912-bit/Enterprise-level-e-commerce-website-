package com.shopstack.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "inbound_shipments")
public class InboundShipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String shipmentNumber; // e.g. INB-2026-89412

    private Long vendorId;
    private String vendorName;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private int declaredQuantity; // Quantity vendor states they sent
    private int receivedQuantity = 0; // Actual physical units counted during GRN inspection
    private int damagedQuantity = 0; // Damaged/defective units flagged during QC (isolated/returned)

    // Status: DRAFT, SHIPPED_BY_VENDOR, RECEIVED_AT_HUB, GRN_GENERATED, STORED_IN_BIN, REJECTED
    private String status;

    private String trackingNumber;
    private String courierPartner;

    private String grnNumber; // Goods Receipt Note ID, e.g. GRN-83912
    private String binLocation; // Shelving bin, e.g. BIN-A1-04

    @Column(length = 2000)
    private String staffInspectionNotes;

    @Column(length = 2000)
    private String vendorNotes;

    private LocalDateTime createdAt;
    private LocalDateTime shippedAt;
    private LocalDateTime receivedAt;
    private LocalDateTime shelvedAt;

    public InboundShipment() {
        this.createdAt = LocalDateTime.now();
        this.status = "DRAFT";
    }

    public InboundShipment(String shipmentNumber, Long vendorId, String vendorName, Product product, Warehouse warehouse, int declaredQuantity, String vendorNotes) {
        this.shipmentNumber = shipmentNumber;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.product = product;
        this.warehouse = warehouse;
        this.declaredQuantity = declaredQuantity;
        this.vendorNotes = vendorNotes;
        this.status = "DRAFT";
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getShipmentNumber() { return shipmentNumber; }
    public void setShipmentNumber(String shipmentNumber) { this.shipmentNumber = shipmentNumber; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }

    public int getDeclaredQuantity() { return declaredQuantity; }
    public void setDeclaredQuantity(int declaredQuantity) { this.declaredQuantity = declaredQuantity; }

    public int getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(int receivedQuantity) { this.receivedQuantity = receivedQuantity; }

    public int getDamagedQuantity() { return damagedQuantity; }
    public void setDamagedQuantity(int damagedQuantity) { this.damagedQuantity = damagedQuantity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCourierPartner() { return courierPartner; }
    public void setCourierPartner(String courierPartner) { this.courierPartner = courierPartner; }

    public String getGrnNumber() { return grnNumber; }
    public void setGrnNumber(String grnNumber) { this.grnNumber = grnNumber; }

    public String getBinLocation() { return binLocation; }
    public void setBinLocation(String binLocation) { this.binLocation = binLocation; }

    public String getStaffInspectionNotes() { return staffInspectionNotes; }
    public void setStaffInspectionNotes(String staffInspectionNotes) { this.staffInspectionNotes = staffInspectionNotes; }

    public String getVendorNotes() { return vendorNotes; }
    public void setVendorNotes(String vendorNotes) { this.vendorNotes = vendorNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }

    public LocalDateTime getReceivedAt() { return receivedAt; }
    public void setReceivedAt(LocalDateTime receivedAt) { this.receivedAt = receivedAt; }

    public LocalDateTime getShelvedAt() { return shelvedAt; }
    public void setShelvedAt(LocalDateTime shelvedAt) { this.shelvedAt = shelvedAt; }
}
