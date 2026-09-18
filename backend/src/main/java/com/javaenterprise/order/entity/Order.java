package com.javaenterprise.order.entity;

import com.javaenterprise.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal totalAmount;
    private String returnReason;

    private LocalDateTime orderDate;
    // Add these fields
    @Column(precision = 10, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal vendorEarning = BigDecimal.ZERO;

    //Coupon
    private String couponCode;

    @Builder.Default
    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    // Add this field to Order.java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipping_address_id")
    private com.javaenterprise.customer.entity.Address shippingAddress;

    @PrePersist
    public void onCreate() {
        orderDate = LocalDateTime.now();

        if (status == null) {
            status = OrderStatus.PENDING;
        }
    }
}