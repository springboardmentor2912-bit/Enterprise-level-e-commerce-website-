package shopstack_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * One entry in the "coupons you could use" list shown on checkout.
 * Includes coupons the current order doesn't yet qualify for (marked
 * ineligible with an explanatory message) so customers can see what
 * they'd need to add to unlock a better deal — not just the ones that
 * already apply.
 */
public class AvailableCouponDTO {

    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderAmount;
    private BigDecimal maxDiscount;
    private LocalDate expiryDate;
    private boolean eligible;
    private BigDecimal estimatedDiscount; // only set when eligible
    private String message; // reason it's not eligible, when applicable

    public AvailableCouponDTO() {
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

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public BigDecimal getEstimatedDiscount() {
        return estimatedDiscount;
    }

    public void setEstimatedDiscount(BigDecimal estimatedDiscount) {
        this.estimatedDiscount = estimatedDiscount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}