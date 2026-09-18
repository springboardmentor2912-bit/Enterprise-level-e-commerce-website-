package com.shopstack.dto;

import java.time.LocalDateTime;

public class WarehouseDTO {
    private Long id;
    private String code;
    private String name;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String contactPhone;
    private String contactEmail;
    private Integer capacity;
    private Boolean active;
    private Long totalStoredUnits;
    private Long totalAllocatedUnits;
    private Long totalAvailableUnits;
    private Double utilizationPercentage;
    private Integer distinctProductCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WarehouseDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Long getTotalStoredUnits() { return totalStoredUnits; }
    public void setTotalStoredUnits(Long totalStoredUnits) { this.totalStoredUnits = totalStoredUnits; }

    public Long getTotalAllocatedUnits() { return totalAllocatedUnits; }
    public void setTotalAllocatedUnits(Long totalAllocatedUnits) { this.totalAllocatedUnits = totalAllocatedUnits; }

    public Long getTotalAvailableUnits() { return totalAvailableUnits; }
    public void setTotalAvailableUnits(Long totalAvailableUnits) { this.totalAvailableUnits = totalAvailableUnits; }

    public Double getUtilizationPercentage() { return utilizationPercentage; }
    public void setUtilizationPercentage(Double utilizationPercentage) { this.utilPercentage(utilizationPercentage); }
    private void utilPercentage(Double v) { this.utilizationPercentage = v; }

    public Integer getDistinctProductCount() { return distinctProductCount; }
    public void setDistinctProductCount(Integer distinctProductCount) { this.distinctProductCount = distinctProductCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
