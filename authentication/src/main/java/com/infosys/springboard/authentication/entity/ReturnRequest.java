package com.infosys.springboard.authentication.entity;

import java.math.BigDecimal;
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
@Table(name = "return_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================
    // ORDER DETAILS
    // ============================

    private Long orderId;

    private Long productId;

    private String customerEmail;

    private Integer quantity;

    // ============================
    // RETURN DETAILS
    // ============================

    private String reason;

    private String status;

    private String adminRemarks;

    private String productCondition;

    // ============================
    // REFUND DETAILS
    // ============================

    private BigDecimal refundAmount;

    private Long refundId;

    private Boolean inventoryUpdated;

    // ============================
    // TIMESTAMPS
    // ============================

    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    private LocalDateTime rejectedAt;

    private LocalDateTime receivedAt;

    private LocalDateTime qualityCheckedAt;

    private LocalDateTime refundInitiatedAt;

    private LocalDateTime refundCompletedAt;
}