package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository
        extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(
            Long orderId
    );
}