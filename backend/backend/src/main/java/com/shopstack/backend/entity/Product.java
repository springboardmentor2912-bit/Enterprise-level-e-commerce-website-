package com.shopstack.backend.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonProperty;



@Entity
@Table(name = "products")
public class Product {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false)
    private String name;



    @Column(nullable = false)
    private String description;



    @Column(nullable = false)
    private double price;

    @Column(nullable = false, columnDefinition = "double precision default 0")
    private double discountPercentage = 0;



    private String category;



    private String imageUrl;

    private int stock = 0;

    // Returned units are isolated from sellable stock and cannot be purchased.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private int returnedStock = 0;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int soldQuantity = 0;

    // New vendor submissions remain pending until an admin assigns a warehouse.
    private String approvalStatus = "APPROVED";




    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "vendor_id",
            nullable = false
    )
    private User vendor;






    public Product() {

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








    public String getDescription() {

        return description;

    }



    public void setDescription(String description) {

        this.description = description;

    }








    public double getPrice() {

        return price;

    }



    public void setPrice(double price) {

        this.price = price;

    }








    public String getCategory() {

        return category;

    }



    public void setCategory(String category) {

        this.category = category;

    }








    public String getImageUrl() {

        return imageUrl;

    }



    public void setImageUrl(String imageUrl) {

        this.imageUrl = imageUrl;

    }

    public double getDiscountPercentage() { return discountPercentage; }

    public void setDiscountPercentage(double discountPercentage) {
        this.discountPercentage = Math.max(0, Math.min(100, discountPercentage));
    }

    @JsonProperty(value = "salePrice", access = JsonProperty.Access.READ_ONLY)
    public double getSalePrice() {
        return Math.round(price * (1 - discountPercentage / 100) * 100.0) / 100.0;
    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }

    public int getReturnedStock() { return returnedStock; }
    public void setReturnedStock(int returnedStock) { this.returnedStock = Math.max(0, returnedStock); }

    public int getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(int soldQuantity) { this.soldQuantity = soldQuantity; }

    public String getApprovalStatus() { return approvalStatus == null ? "APPROVED" : approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }








    public User getVendor() {

        return vendor;

    }



    public void setVendor(User vendor) {

        this.vendor = vendor;

    }



}
