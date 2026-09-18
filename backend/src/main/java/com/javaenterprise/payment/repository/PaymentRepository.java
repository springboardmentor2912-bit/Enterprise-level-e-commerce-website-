package com.javaenterprise.payment.repository;

import com.javaenterprise.payment.entity.Payment;
import com.javaenterprise.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByUserOrderByCreatedAtDesc(User user);

    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByOrderId(Long orderId);

    List<Payment> findByStatusOrderByCreatedAtDesc(com.javaenterprise.payment.entity.PaymentStatus status);
}