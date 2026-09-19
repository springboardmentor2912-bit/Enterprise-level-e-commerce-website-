package com.shopstack.backend.dto;

import java.time.LocalDateTime;

public class CommissionResponse {

    private Long id;
    private Long orderId;
    private Long vendorId;
    private String vendorName;
    private Double saleAmount;
    private Double commissionRate;
    private Double commissionAmount;
    private Double vendorAmount;
    private String status;
    private LocalDateTime createdAt;

    // No-argument constructor
    public CommissionResponse() {
    }

    // Constructor used by CommissionService
    public CommissionResponse(
            Long id,
            Long orderId,
            Long vendorId,
            String vendorName,
            Double saleAmount,
            Double commissionRate,
            Double commissionAmount,
            Double vendorAmount,
            String status,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.orderId = orderId;
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.saleAmount = saleAmount;
        this.commissionRate = commissionRate;
        this.commissionAmount = commissionAmount;
        this.vendorAmount = vendorAmount;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public Double getSaleAmount() {
        return saleAmount;
    }

    public void setSaleAmount(Double saleAmount) {
        this.saleAmount = saleAmount;
    }

    public Double getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(Double commissionRate) {
        this.commissionRate = commissionRate;
    }

    public Double getCommissionAmount() {
        return commissionAmount;
    }

    public void setCommissionAmount(Double commissionAmount) {
        this.commissionAmount = commissionAmount;
    }

    public Double getVendorAmount() {
        return vendorAmount;
    }

    public void setVendorAmount(Double vendorAmount) {
        this.vendorAmount = vendorAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


}
