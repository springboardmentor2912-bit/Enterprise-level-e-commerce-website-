package shopstack_backend.dto;

public class WarehouseStockRequestDTO {

    private Long productId;
    private Integer quantity;

    public WarehouseStockRequestDTO() {
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