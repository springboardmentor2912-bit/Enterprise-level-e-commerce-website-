package com.javaenterprise.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warehouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., "Mumbai Hub", "Delhi Warehouse"

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}