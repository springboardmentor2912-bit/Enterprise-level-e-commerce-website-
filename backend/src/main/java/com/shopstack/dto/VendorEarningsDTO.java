package com.shopstack.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class VendorEarningsDTO {

    private Long vendorId;
    private String businessName;
    private BigDecimal commissionRate;
    private BigDecimal totalGrossSales;
    private BigDecimal totalCommissionDeducted;
    private BigDecimal netEarnings;
    private List<ItemizedEarningDTO> itemizedEarnings;

    public VendorEarningsDTO() {
    }

    public static class ItemizedEarningDTO {
        private Long orderId;
        private Long orderItemId;
        private String productName;
        private Integer quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal itemTotal;
        private BigDecimal commissionRate;
        private BigDecimal commissionDeducted;
        private BigDecimal netEarning;
        private LocalDateTime orderDate;

        public ItemizedEarningDTO() {
        }

        public ItemizedEarningDTO(Long orderId, Long orderItemId, String productName, Integer quantity, BigDecimal priceAtPurchase, BigDecimal itemTotal, BigDecimal commissionRate, BigDecimal commissionDeducted, BigDecimal netEarning, LocalDateTime orderDate) {
            this.orderId = orderId;
            this.orderItemId = orderItemId;
            this.productName = productName;
            this.quantity = quantity;
            this.priceAtPurchase = priceAtPurchase;
            this.itemTotal = itemTotal;
            this.commissionRate = commissionRate;
            this.commissionDeducted = commissionDeducted;
            this.netEarning = netEarning;
            this.orderDate = orderDate;
        }

        public Long getOrderId() {
            return orderId;
        }

        public void setOrderId(Long orderId) {
            this.orderId = orderId;
        }

        public Long getOrderItemId() {
            return orderItemId;
        }

        public void setOrderItemId(Long orderItemId) {
            this.orderItemId = orderItemId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getPriceAtPurchase() {
            return priceAtPurchase;
        }

        public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
            this.priceAtPurchase = priceAtPurchase;
        }

        public BigDecimal getItemTotal() {
            return itemTotal;
        }

        public void setItemTotal(BigDecimal itemTotal) {
            this.itemTotal = itemTotal;
        }

        public BigDecimal getCommissionRate() {
            return commissionRate;
        }

        public void setCommissionRate(BigDecimal commissionRate) {
            this.commissionRate = commissionRate;
        }

        public BigDecimal getCommissionDeducted() {
            return commissionDeducted;
        }

        public void setCommissionDeducted(BigDecimal commissionDeducted) {
            this.commissionDeducted = commissionDeducted;
        }

        public BigDecimal getNetEarning() {
            return netEarning;
        }

        public void setNetEarning(BigDecimal netEarning) {
            this.netEarning = netEarning;
        }

        public LocalDateTime getOrderDate() {
            return orderDate;
        }

        public void setOrderDate(LocalDateTime orderDate) {
            this.orderDate = orderDate;
        }
    }

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public BigDecimal getCommissionRate() {
        return commissionRate;
    }

    public void setCommissionRate(BigDecimal commissionRate) {
        this.commissionRate = commissionRate;
    }

    public BigDecimal getTotalGrossSales() {
        return totalGrossSales;
    }

    public void setTotalGrossSales(BigDecimal totalGrossSales) {
        this.totalGrossSales = totalGrossSales;
    }

    public BigDecimal getTotalCommissionDeducted() {
        return totalCommissionDeducted;
    }

    public void setTotalCommissionDeducted(BigDecimal totalCommissionDeducted) {
        this.totalCommissionDeducted = totalCommissionDeducted;
    }

    public BigDecimal getNetEarnings() {
        return netEarnings;
    }

    public void setNetEarnings(BigDecimal netEarnings) {
        this.netEarnings = netEarnings;
    }

    public List<ItemizedEarningDTO> getItemizedEarnings() {
        return itemizedEarnings;
    }

    public void setItemizedEarnings(List<ItemizedEarningDTO> itemizedEarnings) {
        this.itemizedEarnings = itemizedEarnings;
    }
}
