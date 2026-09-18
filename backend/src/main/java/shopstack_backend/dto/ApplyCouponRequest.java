package shopstack_backend.dto;

public class ApplyCouponRequest {

    private String code;

    // Present only when validating a coupon for a "Buy Now" single-product
    // purchase instead of the cart. If null, the customer's current cart
    // is used to compute the subtotal.
    private Long productId;
    private Integer quantity;

    public ApplyCouponRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}