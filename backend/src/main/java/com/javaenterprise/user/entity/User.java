package com.javaenterprise.user.entity;

import com.javaenterprise.warehouse.entity.Warehouse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable because OAuth2 users won't have a local password
    private String password;

    private String phone;

    private String address;

    @Builder.Default
    @Column(nullable = false)
    private boolean enabled = true;
    // 🆕 ADD THIS FIELD FOR WAREHOUSE STAFF ASSIGNMENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    // OAuth2 support
    private String provider; // "LOCAL", "GOOGLE"
    private String providerId;

    // Password reset support
    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Add this field
    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal commissionRate = BigDecimal.valueOf(10.00); // Default 10%

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.provider == null) this.provider = "LOCAL";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}