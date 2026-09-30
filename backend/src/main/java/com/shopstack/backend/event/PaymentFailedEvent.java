package com.shopstack.backend.event;

import com.shopstack.backend.model.User;

public class PaymentFailedEvent {

    private final Long userId;
    private final String customerEmail;
    private final String customerName;
    private final String orderId;
    private final String razorpayOrderId;
    private final double amount;
    private final String failureReason;
    private final User user;

    public PaymentFailedEvent(Long userId, String customerEmail, String customerName, 
                              String orderId, String razorpayOrderId, double amount, 
                              String failureReason, User user) {
        this.userId = userId;
        this.customerEmail = customerEmail;
        this.customerName = customerName;
        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.amount = amount;
        this.failureReason = failureReason;
        this.user = user;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public double getAmount() {
        return amount;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public User getUser() {
        return user;
    }

    @Override
    public String toString() {
        return "PaymentFailedEvent{" +
                "userId=" + userId +
                ", customerEmail='" + customerEmail + '\'' +
                ", orderId='" + orderId + '\'' +
                ", razorpayOrderId='" + razorpayOrderId + '\'' +
                ", amount=" + amount +
                ", failureReason='" + failureReason + '\'' +
                '}';
    }
}
