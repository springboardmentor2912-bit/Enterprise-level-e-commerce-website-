package com.shopstack.dto;

import com.shopstack.entity.WishlistItem;
import java.time.LocalDateTime;

public class WishlistItemDTO {

    private Long id;
    private ProductDTO product;
    private LocalDateTime addedAt;

    public WishlistItemDTO() {
    }

    public WishlistItemDTO(WishlistItem item) {
        this.id = item.getId();
        this.product = item.getProduct() != null ? new ProductDTO(item.getProduct()) : null;
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

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
