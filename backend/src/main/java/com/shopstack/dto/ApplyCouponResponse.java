package com.shopstack.dto;

import java.math.BigDecimal;

public class ApplyCouponResponse {

    private boolean valid;
    private String message;
    private String code;
    private BigDecimal grossTotal;
    private BigDecimal discountAmount;
    private BigDecimal netTotal;

    public ApplyCouponResponse() {
    }

    public ApplyCouponResponse(boolean valid, String message, String code, BigDecimal grossTotal, BigDecimal discountAmount, BigDecimal netTotal) {
        this.valid = valid;
        this.message = message;
        this.code = code;
        this.grossTotal = grossTotal;
        this.discountAmount = discountAmount;
        this.netTotal = netTotal;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public BigDecimal getGrossTotal() {
        return grossTotal;
    }

    public void setGrossTotal(BigDecimal grossTotal) {
        this.grossTotal = grossTotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getNetTotal() {
        return netTotal;
    }

    public void setNetTotal(BigDecimal netTotal) {
        this.netTotal = netTotal;
    }
}
