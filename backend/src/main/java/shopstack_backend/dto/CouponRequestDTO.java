package shopstack_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CouponRequestDTO {

    private String code;
    private String discountType; // "PERCENTAGE" or "FLAT"
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;   // nullable
    private BigDecimal maxDiscount;      // nullable, PERCENTAGE only
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Integer usageLimit;          // nullable = unlimited
    private Integer perCustomerLimit;    // nullable = no per-customer cap
    private Boolean active;

    public CouponRequestDTO() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDiscountType() {
        return discountType;
    }

    public void setDiscountType(String discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getDiscountValue() {
        return discountValue;
    }

    public void setDiscountValue(BigDecimal discountValue) {
        this.discountValue = discountValue;
    }

    public BigDecimal getMinOrderAmount() {
        return minOrderAmount;
    }

    public void setMinOrderAmount(BigDecimal minOrderAmount) {
        this.minOrderAmount = minOrderAmount;
    }

    public BigDecimal getMaxDiscount() {
        return maxDiscount;
    }

    public void setMaxDiscount(BigDecimal maxDiscount) {
        this.maxDiscount = maxDiscount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getUsageLimit() {
        return usageLimit;
    }

    public void setUsageLimit(Integer usageLimit) {
        this.usageLimit = usageLimit;
    }

    public Integer getPerCustomerLimit() {
        return perCustomerLimit;
    }

    public void setPerCustomerLimit(Integer perCustomerLimit) {
        this.perCustomerLimit = perCustomerLimit;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}