package com.shopstack.shopstack_backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    private Long orderId;


    private Long customerId;


    private double amount;


    private String paymentMethod;


    private String status;


    private String transactionId;


    private LocalDateTime paymentDate;


    public Payment() {
    }


    public Long getId() {
        return id;
    }


    public Long getOrderId() {
        return orderId;
    }


    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }


    public Long getCustomerId() {
        return customerId;
    }


    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }


    public double getAmount() {
        return amount;
    }


    public void setAmount(double amount) {
        this.amount = amount;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }


    public void setPaymentMethod(
            String paymentMethod) {

        this.paymentMethod = paymentMethod;
    }


    public String getStatus() {
        return status;
    }


    public void setStatus(String status) {
        this.status = status;
    }


    public String getTransactionId() {
        return transactionId;
    }


    public void setTransactionId(
            String transactionId) {

        this.transactionId = transactionId;
    }


    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }


    public void setPaymentDate(
            LocalDateTime paymentDate) {

        this.paymentDate = paymentDate;
    }
}