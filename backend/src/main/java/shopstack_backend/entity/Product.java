package shopstack_backend.entity;

import java.math.BigDecimal;
import java.math.RoundingMode;

import jakarta.persistence.*;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String brand;

    @Column(length = 1000)
    private String description;

    // Money should use BigDecimal
    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private String imageUrl;

    // Percentage off, 0-100.
    // Null/0 means no discount is active.
    private Double discountPercentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private Vendor vendor;

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

   

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

  

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

  
    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

  

    public Integer getStockQuantity() {
        return stockQuantity != null ? stockQuantity : 0;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }



    public Double getDiscountPercentage() {
        return discountPercentage != null
                ? discountPercentage
                : 0.0;
    }

    public void setDiscountPercentage(Double discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getFinalPrice() {

        if (price == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal basePrice = price.setScale(
                2,
                RoundingMode.HALF_UP
        );

        BigDecimal discount = BigDecimal.valueOf(
                getDiscountPercentage()
        );

        // No discount
        if (discount.compareTo(BigDecimal.ZERO) <= 0) {
            return basePrice;
        }

        // 100% or more discount
        if (discount.compareTo(BigDecimal.valueOf(100)) >= 0) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        BigDecimal discountAmount = basePrice
                .multiply(discount)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );

        return basePrice
                .subtract(discountAmount)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }
}