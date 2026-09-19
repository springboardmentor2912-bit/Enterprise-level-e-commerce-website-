package com.shopstack.backend.dto;

public class WarehouseInventoryRequest {
    private Long productId;
    private Integer quantity;
    public Long getProductId(){return productId;} public void setProductId(Long v){productId=v;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer v){quantity=v;}
}
