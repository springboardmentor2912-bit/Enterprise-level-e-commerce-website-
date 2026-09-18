package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantityChange;

    @Column(nullable = false)
    private Integer stockBefore;

    @Column(nullable = false)
    private Integer stockAfter;

    @Column(nullable = false)
    private String action;

    private Long referenceId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}