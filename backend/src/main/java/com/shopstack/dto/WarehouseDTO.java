package com.shopstack.dto;

import com.shopstack.entity.Warehouse;
import com.shopstack.entity.WarehouseStatus;

import java.time.LocalDateTime;

public class WarehouseDTO {
    private Long id;
    private String name;
    private String code;
    private String location;
    private String contact;
    private WarehouseStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WarehouseDTO() {
    }

    public WarehouseDTO(Warehouse warehouse) {
        this.id = warehouse.getId();
        this.name = warehouse.getName();
        this.code = warehouse.getCode();
        this.location = warehouse.getLocation();
        this.contact = warehouse.getContact();
        this.status = warehouse.getStatus();
        this.createdAt = warehouse.getCreatedAt();
        this.updatedAt = warehouse.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public WarehouseStatus getStatus() {
        return status;
    }

    public void setStatus(WarehouseStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
