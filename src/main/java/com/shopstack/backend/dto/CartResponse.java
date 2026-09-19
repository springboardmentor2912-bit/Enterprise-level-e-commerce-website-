package com.shopstack.backend.dto;

import java.util.List;

public class CartResponse {

    private List<CartItemResponse> items;
    private Double total;

    public CartResponse() {
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }
}