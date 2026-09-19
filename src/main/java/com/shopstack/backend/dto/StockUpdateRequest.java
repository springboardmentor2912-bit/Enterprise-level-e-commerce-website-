package com.shopstack.backend.dto;

public class StockUpdateRequest {

    private Integer quantity;

    public StockUpdateRequest() {
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}