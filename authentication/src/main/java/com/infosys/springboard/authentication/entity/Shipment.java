package com.infosys.springboard.authentication.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private Long warehouseId;

    private String trackingNumber;

    private String carrier;

    private String status;

    private LocalDateTime shippedAt;

    private LocalDateTime deliveredAt;

    private String remarks;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}