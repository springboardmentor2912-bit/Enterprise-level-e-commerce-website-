package com.shopstack.shopstack_backend.dto;

import com.shopstack.shopstack_backend.entity.VendorStatus;

public class AdminVendorDetailsResponse {

    private Long vendorId;
    private String vendorName;
    private String email;
    private String role;

    private VendorStatus vendorStatus;

    private long totalProducts;
    private long activeProducts;

    private long totalOrders;
    private double totalSales;


    public AdminVendorDetailsResponse(
            Long vendorId,
            String vendorName,
            String email,
            String role,
            VendorStatus vendorStatus,
            long totalProducts,
            long activeProducts,
            long totalOrders,
            double totalSales
    ) {

        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.email = email;
        this.role = role;
        this.vendorStatus = vendorStatus;
        this.totalProducts = totalProducts;
        this.activeProducts = activeProducts;
        this.totalOrders = totalOrders;
        this.totalSales = totalSales;
    }


    public Long getVendorId() {
        return vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public VendorStatus getVendorStatus() {
        return vendorStatus;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public long getActiveProducts() {
        return activeProducts;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public double getTotalSales() {
        return totalSales;
    }
}