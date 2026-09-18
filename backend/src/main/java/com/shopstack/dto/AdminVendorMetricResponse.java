package com.shopstack.dto;

import com.shopstack.model.VendorStatus;
import java.time.LocalDateTime;

public class AdminVendorMetricResponse {
    private Long id;
    private Long userId;
    private String storeName;
    private String description;
    private String logoUrl;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private VendorStatus status;
    private Double commissionRate;
    private Double rating;
    private long productCount;
    private long orderCount;
    private double grossSales;
    private double commissionPaid;
    private double netPayout;
    private LocalDateTime createdAt;

    public AdminVendorMetricResponse() {}

    public AdminVendorMetricResponse(Long id, Long userId, String storeName, String description, String logoUrl,
                                     String ownerName, String ownerEmail, String ownerPhone,
                                     VendorStatus status, Double commissionRate, Double rating,
                                     long productCount, long orderCount, double grossSales,
                                     double commissionPaid, double netPayout, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.storeName = storeName;
        this.description = description;
        this.logoUrl = logoUrl;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.ownerPhone = ownerPhone;
        this.status = status;
        this.commissionRate = commissionRate;
        this.rating = rating;
        this.productCount = productCount;
        this.orderCount = orderCount;
        this.grossSales = grossSales;
        this.commissionPaid = commissionPaid;
        this.netPayout = netPayout;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getOwnerPhone() { return ownerPhone; }
    public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

    public VendorStatus getStatus() { return status; }
    public void setStatus(VendorStatus status) { this.status = status; }

    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public long getProductCount() { return productCount; }
    public void setProductCount(long productCount) { this.productCount = productCount; }

    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }

    public double getGrossSales() { return grossSales; }
    public void setGrossSales(double grossSales) { this.grossSales = grossSales; }

    public double getCommissionPaid() { return commissionPaid; }
    public void setCommissionPaid(double commissionPaid) { this.commissionPaid = commissionPaid; }

    public double getNetPayout() { return netPayout; }
    public void setNetPayout(double netPayout) { this.netPayout = netPayout; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
