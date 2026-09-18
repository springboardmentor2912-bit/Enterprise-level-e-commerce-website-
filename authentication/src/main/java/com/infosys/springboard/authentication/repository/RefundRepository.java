package com.infosys.springboard.authentication.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.Refund;

@Repository
public interface RefundRepository
        extends JpaRepository<Refund, Long> {

    List<Refund> findByCustomerEmail(String customerEmail);

    List<Refund> findByStatus(String status);

    Optional<Refund> findByOrderId(Long orderId);
}