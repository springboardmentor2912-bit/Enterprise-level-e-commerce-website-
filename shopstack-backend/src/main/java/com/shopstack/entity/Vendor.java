package com.shopstack.entity;

import com.shopstack.enums.VendorApprovalStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String businessName;

    private String businessDescription;
    private String gstNumber;
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VendorApprovalStatus approvalStatus = VendorApprovalStatus.PENDING;

    @Builder.Default
    private BigDecimal commissionRate = BigDecimal.valueOf(10.0); // percentage

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
