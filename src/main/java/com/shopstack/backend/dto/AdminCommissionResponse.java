package com.shopstack.backend.dto;

import java.time.LocalDateTime;

public class AdminCommissionResponse {

    private Long id;
    private Long orderId;
    private Long vendorId;
    private String vendorName;

    private Double saleAmount;
    private Double commissionRate;
    private Double commissionAmount;
    private Double vendorAmount;

    private String status;
    private LocalDateTime commissionDate;

    public AdminCommissionResponse() {
    }

    public AdminCommissionResponse(
            Long id,
            Long orderId,
            Long vendorId,
            String vendorName,
            Double saleAmount,
            Double commissionRate,
            Double commissionAmount,
            Double vendorAmount,
            String status,
            LocalDateTime commissionDate
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
        this.commissionDate = commissionDate;
    }

    public Long getId() {
        return id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getVendorId() {
        return vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public Double getSaleAmount() {
        return saleAmount;
    }

    public Double getCommissionRate() {
        return commissionRate;
    }

    public Double getCommissionAmount() {
        return commissionAmount;
    }

    public Double getVendorAmount() {
        return vendorAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCommissionDate() {
        return commissionDate;
    }
}