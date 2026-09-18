package com.shopstack.dto;

import com.shopstack.model.StockMovementStage;
import java.time.LocalDateTime;

public class OrderWarehouseAllocationDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long orderItemId;
    private Long productId;
    private String productTitle;
    private String productSku;
    private String productImageUrl;
    private Double productPrice;
    private String vendorStoreName;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private String warehouseCity;
    private Integer allocatedQuantity;
    private StockMovementStage stage;
    private String aisleLocation;

    // Pick info
    private String pickerName;
    private LocalDateTime pickedAt;
    private String pickerNotes;

    // Pack info
    private String packerName;
    private LocalDateTime packedAt;
    private Double packageWeightKg;
    private String boxDimension;
    private String boxType;
    private String packingSlipNumber;

    // Shipment info
    private String carrier;
    private String trackingNumber;
    private LocalDateTime readyForShipmentAt;
    private LocalDateTime dispatchedAt;

    private String customerName;
    private String shippingAddress;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderWarehouseAllocationDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductTitle() { return productTitle; }
    public void setProductTitle(String productTitle) { this.productTitle = productTitle; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getProductImageUrl() { return productImageUrl; }
    public void setProductImageUrl(String productImageUrl) { this.productImageUrl = productImageUrl; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public String getVendorStoreName() { return vendorStoreName; }
    public void setVendorStoreName(String vendorStoreName) { this.vendorStoreName = vendorStoreName; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseCity() { return warehouseCity; }
    public void setWarehouseCity(String warehouseCity) { this.warehouseCity = warehouseCity; }

    public Integer getAllocatedQuantity() { return allocatedQuantity; }
    public void setAllocatedQuantity(Integer allocatedQuantity) { this.allocatedQuantity = allocatedQuantity; }

    public StockMovementStage getStage() { return stage; }
    public void setStage(StockMovementStage stage) { this.stage = stage; }

    public String getAisleLocation() { return aisleLocation; }
    public void setAisleLocation(String aisleLocation) { this.aisleLocation = aisleLocation; }

    public String getPickerName() { return pickerName; }
    public void setPickerName(String pickerName) { this.pickerName = pickerName; }

    public LocalDateTime getPickedAt() { return pickedAt; }
    public void setPickedAt(LocalDateTime pickedAt) { this.pickedAt = pickedAt; }

    public String getPickerNotes() { return pickerNotes; }
    public void setPickerNotes(String pickerNotes) { this.pickerNotes = pickerNotes; }

    public String getPackerName() { return packerName; }
    public void setPackerName(String packerName) { this.packerName = packerName; }

    public LocalDateTime getPackedAt() { return packedAt; }
    public void setPackedAt(LocalDateTime packedAt) { this.packedAt = packedAt; }

    public Double getPackageWeightKg() { return packageWeightKg; }
    public void setPackageWeightKg(Double packageWeightKg) { this.packageWeightKg = packageWeightKg; }

    public String getBoxDimension() { return boxDimension; }
    public void setBoxDimension(String boxDimension) { this.boxDimension = boxDimension; }

    public String getBoxType() { return boxType; }
    public void setBoxType(String boxType) { this.boxType = boxType; }

    public String getPackingSlipNumber() { return packingSlipNumber; }
    public void setPackingSlipNumber(String packingSlipNumber) { this.packingSlipNumber = packingSlipNumber; }

    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public LocalDateTime getReadyForShipmentAt() { return readyForShipmentAt; }
    public void setReadyForShipmentAt(LocalDateTime readyForShipmentAt) { this.readyForShipmentAt = readyForShipmentAt; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
