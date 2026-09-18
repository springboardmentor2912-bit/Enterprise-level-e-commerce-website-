package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Refund;
import com.shopstack.shopstack_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefundRepository
        extends JpaRepository<Refund, Long> {

    Optional<Refund> findByOrder(Order order);

    boolean existsByOrder(Order order);
}