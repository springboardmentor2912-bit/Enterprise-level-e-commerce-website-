package com.shopstack.repository;

import com.shopstack.model.Payment;
import com.shopstack.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Payment> findByStatus(PaymentStatus status);
    List<Payment> findAllByOrderByCreatedAtDesc();
    List<Payment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'PAID'")
    long countPaidTransactions();

    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = 'PAID'")
    Double calculateTotalPaidRevenue();
}
