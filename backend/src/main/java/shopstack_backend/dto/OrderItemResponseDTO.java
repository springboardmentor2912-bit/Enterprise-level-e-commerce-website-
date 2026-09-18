package shopstack_backend.dto;

import java.math.BigDecimal;

public class OrderItemResponseDTO {

    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal priceAtPurchase;
    private Integer quantity;
    private BigDecimal lineTotal;
    private String status;
    private RefundResponseDTO refund; // null unless this item was actually refunded

    public OrderItemResponseDTO() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPriceAtPurchase() {
        return priceAtPurchase;
    }

    public void setPriceAtPurchase(BigDecimal priceAtPurchase) {
        this.priceAtPurchase = priceAtPurchase;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public RefundResponseDTO getRefund() {
        return refund;
    }

    public void setRefund(RefundResponseDTO refund) {
        this.refund = refund;
    }
}