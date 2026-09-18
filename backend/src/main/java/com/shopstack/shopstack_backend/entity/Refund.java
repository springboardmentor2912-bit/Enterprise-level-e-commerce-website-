package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Refund extends BaseEntity {

    @OneToOne
    @JoinColumn(
            name = "order_id",
            nullable = false,
            unique = true
    )
    private Order order;

    @Column(nullable = false)
    private Double refundAmount;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime refundedAt;
}