package com.shopstack.dto;

import jakarta.validation.constraints.NotBlank;

public class WarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private String state;
    private String country = "India";
    private String pincode;
    private String contactPhone;
    private String contactEmail;
    private Integer capacity = 50000;
    private Boolean active = true;

    public WarehouseRequest() {}

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
}
