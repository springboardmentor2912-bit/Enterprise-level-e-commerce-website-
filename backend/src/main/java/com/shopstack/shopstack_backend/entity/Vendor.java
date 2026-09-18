package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vendors")
public class Vendor extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String businessName;

    @Column(nullable = false)
    private String businessEmail;

    @Column(nullable = false)
    private String businessPhone;

    @Column(nullable = false)
    private String gstNumber;

    @Column(nullable = false)
    private String businessAddress;

    @Column(nullable = false)
    private boolean approved = false;
}