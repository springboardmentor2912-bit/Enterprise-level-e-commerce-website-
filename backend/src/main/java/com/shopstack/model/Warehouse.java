package com.shopstack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "warehouses")
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g. WH-HYD-01, WH-MUM-01

    @Column(nullable = false)
    private String name; // e.g. Central Metro Fulfillment Hub

    private String address;

    @Column(nullable = false)
    private String city;

    private String state;

    private String country = "India";

    private String pincode;

    private String contactPhone;

    private String contactEmail;

    private Integer capacity = 50000; // Total unit storage capacity

    private Boolean active = true;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Warehouse() {}

    public Warehouse(Long id, String code, String name, String address, String city, String state,
                     String country, String pincode, String contactPhone, String contactEmail,
                     Integer capacity, Boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country != null ? country : "India";
        this.pincode = pincode;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.capacity = capacity != null ? capacity : 50000;
        this.active = active != null ? active : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
        if (this.country == null) {
            this.country = "India";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static WarehouseBuilder builder() {
        return new WarehouseBuilder();
    }

    public static class WarehouseBuilder {
        private Long id;
        private String code;
        private String name;
        private String address;
        private String city;
        private String state;
        private String country = "India";
        private String pincode;
        private String contactPhone;
        private String contactEmail;
        private Integer capacity = 50000;
        private Boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public WarehouseBuilder id(Long id) { this.id = id; return this; }
        public WarehouseBuilder code(String code) { this.code = code; return this; }
        public WarehouseBuilder name(String name) { this.name = name; return this; }
        public WarehouseBuilder address(String address) { this.address = address; return this; }
        public WarehouseBuilder city(String city) { this.city = city; return this; }
        public WarehouseBuilder state(String state) { this.state = state; return this; }
        public WarehouseBuilder country(String country) { this.country = country; return this; }
        public WarehouseBuilder pincode(String pincode) { this.pincode = pincode; return this; }
        public WarehouseBuilder contactPhone(String contactPhone) { this.contactPhone = contactPhone; return this; }
        public WarehouseBuilder contactEmail(String contactEmail) { this.contactEmail = contactEmail; return this; }
        public WarehouseBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public WarehouseBuilder active(Boolean active) { this.active = active; return this; }
        public WarehouseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public WarehouseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Warehouse build() {
            return new Warehouse(id, code, name, address, city, state, country, pincode, contactPhone, contactEmail, capacity, active, createdAt, updatedAt);
        }
    }
}
