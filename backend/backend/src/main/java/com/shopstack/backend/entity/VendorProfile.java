package com.shopstack.backend.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;



@Entity
@Table(name = "vendor_profiles")
public class VendorProfile {

    @Transient
    private String vendorName;



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;




    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            unique = true
    )
    private User user;




    @Column(nullable = false)
    private String businessName;




    private String contactNumber;




    private String address;




    @Column(length = 1000)
    private String description;






    public VendorProfile() {

    }






    public VendorProfile(
            User user,
            String businessName
    ) {

        this.user = user;
        this.businessName = businessName;

    }







    public Long getId() {

        return id;

    }



    public void setId(Long id) {

        this.id = id;

    }







    public User getUser() {

        return user;

    }



    public void setUser(User user) {

        this.user = user;

    }







    public String getBusinessName() {

        return businessName;

    }



    public void setBusinessName(String businessName) {

        this.businessName = businessName;

    }







    public String getContactNumber() {

        return contactNumber;

    }



    public void setContactNumber(String contactNumber) {

        this.contactNumber = contactNumber;

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

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }


}
