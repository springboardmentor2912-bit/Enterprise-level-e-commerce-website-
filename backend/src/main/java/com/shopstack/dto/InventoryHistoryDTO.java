package com.shopstack.dto;

import com.shopstack.entity.InventoryHistory;
import java.time.LocalDateTime;

public class InventoryHistoryDTO {

    private Long id;
    private Long productId;
    private String productName;
    private Integer quantityChange;
    private Integer resultingStock;
    private String changeReason;
    private LocalDateTime createdAt;

    public InventoryHistoryDTO() {
    }

    public InventoryHistoryDTO(InventoryHistory history) {
        this.id = history.getId();
        if (history.getProduct() != null) {
            this.productId = history.getProduct().getId();
            this.productName = history.getProduct().getName();
        }
        this.quantityChange = history.getQuantityChange();
        this.resultingStock = history.getResultingStock();
        this.changeReason = history.getChangeReason();
        this.createdAt = history.getCreatedAt();
    }

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

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public Integer getResultingStock() {
        return resultingStock;
    }

    public void setResultingStock(Integer resultingStock) {
        this.resultingStock = resultingStock;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public void setChangeReason(String changeReason) {
        this.changeReason = changeReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
