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

    private String customerEmail;

    private BigDecimal totalAmount;

    private String status;

    private LocalDateTime orderDate;

    // ============================
    // DELIVERY ADDRESS
    // ============================

    private Long addressId;

    // ============================
    // PAYMENT DETAILS
    // ============================

    private String paymentMethod;

    private String paymentStatus;

    // ============================
    // COUPON DETAILS
    // ============================

    private String couponCode;

    // ============================
    // RAZORPAY PAYMENT DETAILS
    // ============================

    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    // ============================
    // RETURN & REFUND DETAILS
    // ============================

    private String returnStatus;

    private String returnReason;

    private BigDecimal refundAmount;

    private String refundTransactionId;

    private LocalDateTime returnRequestedDate;

    private LocalDateTime refundDate;
}