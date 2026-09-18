package com.shopstack.dto;

import com.shopstack.entity.Role;
import com.shopstack.entity.Vendor;
import java.time.LocalDateTime;

public class VendorDTO {

    private Long id;
    private String businessName;
    private String email;
    private String phone;
    private String address;
    private String description;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;

    public VendorDTO() {
    }

    public VendorDTO(Vendor vendor) {
        this.id = vendor.getId();
        this.businessName = vendor.getBusinessName();
        this.email = vendor.getEmail();
        this.phone = vendor.getPhone();
        this.address = vendor.getAddress();
        this.description = vendor.getDescription();
        this.role = vendor.getRole();
        this.active = vendor.getActive();
        this.createdAt = vendor.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
