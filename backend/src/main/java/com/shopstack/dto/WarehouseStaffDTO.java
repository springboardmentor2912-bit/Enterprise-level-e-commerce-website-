package com.shopstack.dto;

import com.shopstack.entity.Customer;
import com.shopstack.entity.Role;

import java.time.LocalDateTime;

public class WarehouseStaffDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private LocalDateTime createdAt;

    public WarehouseStaffDTO() {
    }

    public WarehouseStaffDTO(Customer customer) {
        this.id = customer.getId();
        this.name = customer.getName();
        this.email = customer.getEmail();
        this.phone = customer.getPhone();
        this.role = customer.getRole();
        this.createdAt = customer.getCreatedAt();
        if (customer.getWarehouse() != null) {
            this.warehouseId = customer.getWarehouse().getId();
            this.warehouseName = customer.getWarehouse().getName();
            this.warehouseCode = customer.getWarehouse().getCode();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }

    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }

    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
