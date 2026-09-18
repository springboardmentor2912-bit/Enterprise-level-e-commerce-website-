package com.shopstack.dto;

import com.shopstack.entity.CartItem;
import java.time.LocalDateTime;

public class CartItemDTO {

    private Long id;
    private ProductDTO product;
    private Integer quantity;
    private LocalDateTime addedAt;

    public CartItemDTO() {
    }

    public CartItemDTO(CartItem item) {
        this.id = item.getId();
        this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
        this.quantity = item.getQuantity();
        this.addedAt = item.getAddedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProductDTO getProduct() {
        return product;
    }

    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
