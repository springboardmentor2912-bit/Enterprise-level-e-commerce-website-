package shopstack_backend.dto;

public class AddWishlistItemRequest {

    private Long productId;

    public AddWishlistItemRequest() {}

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}