package com.shopstack.dto;

import com.shopstack.model.Commission;
import com.shopstack.model.CommissionStatus;

import java.time.LocalDateTime;

public class CommissionResponse {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private Long customerId;
    private String customerName;
    private Long vendorId;
    private String vendorStoreName;
    private String vendorEmail;
    private Double orderAmount;
    private Double commissionRate;
    private Double commissionAmount;
    private Double vendorAmount;
    private CommissionStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime settledAt;

    public CommissionResponse() {}

    public static CommissionResponse fromEntity(Commission commission) {
        if (commission == null) return null;

        CommissionResponse response = new CommissionResponse();
        response.setId(commission.getId());
        response.setOrderAmount(commission.getOrderAmount());
        response.setCommissionRate(commission.getCommissionRate());
        response.setCommissionAmount(commission.getCommissionAmount());
        response.setVendorAmount(commission.getVendorAmount());
        response.setStatus(commission.getStatus());
        response.setCreatedAt(commission.getCreatedAt());
        response.setSettledAt(commission.getSettledAt());

        if (commission.getOrder() != null) {
            response.setOrderId(commission.getOrder().getId());
            response.setOrderNumber(commission.getOrder().getOrderNumber());
            if (commission.getOrder().getCustomer() != null) {
                response.setCustomerId(commission.getOrder().getCustomer().getId());
                response.setCustomerName(commission.getOrder().getCustomer().getFullName());
            }
        }

        if (commission.getVendorProfile() != null) {
            response.setVendorId(commission.getVendorProfile().getId());
            response.setVendorStoreName(commission.getVendorProfile().getStoreName());
            if (commission.getVendorProfile().getUser() != null) {
                response.setVendorEmail(commission.getVendorProfile().getUser().getEmail());
            }
        }

        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getVendorStoreName() { return vendorStoreName; }
    public void setVendorStoreName(String vendorStoreName) { this.vendorStoreName = vendorStoreName; }

    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }

    public Double getOrderAmount() { return orderAmount; }
    public void setOrderAmount(Double orderAmount) { this.orderAmount = orderAmount; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Double getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Double commissionAmount) { this.commissionAmount = commissionAmount; }

    public Double getVendorAmount() { return vendorAmount; }
    public void setVendorAmount(Double vendorAmount) { this.vendorAmount = vendorAmount; }

    public CommissionStatus getStatus() { return status; }
    public void setStatus(CommissionStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
}
