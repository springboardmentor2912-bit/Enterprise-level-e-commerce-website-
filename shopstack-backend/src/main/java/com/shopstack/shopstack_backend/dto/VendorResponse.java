package com.shopstack.shopstack_backend.dto;

import com.shopstack.shopstack_backend.entity.User;

public class VendorResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String country;
    private String role;

    public VendorResponse(User user) {

        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
        this.city = user.getCity();
        this.state = user.getState();
        this.pincode = user.getPincode();
        this.country = user.getCountry();
        this.role = user.getRole().name();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    public String getCountry() {
        return country;
    }

    public String getRole() {
        return role;
    }
}