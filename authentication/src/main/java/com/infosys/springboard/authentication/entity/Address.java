package com.infosys.springboard.authentication.entity;
import jakarta.persistence.*;

@Entity
@Table(name = "addresses")
public class Address {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private String addressLine;

private String city;

private String state;

private String postalCode;

private String country;

private String phoneNumber;

@ManyToOne
@JoinColumn(name = "user_id", nullable = false)
private User user;

public Address() {
}

public Long getId() {
    return id;
}

public void setId(Long id) {
    this.id = id;
}

public String getAddressLine() {
    return addressLine;
}

public void setAddressLine(String addressLine) {
    this.addressLine = addressLine;
}

public String getCity() {
    return city;
}

public void setCity(String city) {
    this.city = city;
}

public String getState() {
    return state;
}

public void setState(String state) {
    this.state = state;
}

public String getPostalCode() {
    return postalCode;
}

public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
}

public String getCountry() {
    return country;
}

public void setCountry(String country) {
    this.country = country;
}

public String getPhoneNumber() {
    return phoneNumber;
}

public void setPhoneNumber(String phoneNumber) {
    this.phoneNumber = phoneNumber;
}

public User getUser() {
    return user;
}

public void setUser(User user) {
    this.user = user;
}

}