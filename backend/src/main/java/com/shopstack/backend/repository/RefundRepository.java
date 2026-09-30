package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.model.Refund;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findByOrderId(String orderId);
    List<Refund> findByOrderIdOrderByIdDesc(String orderId);
    List<Refund> findByStatusOrderByIdDesc(String status);
    List<Refund> findAllByOrderByIdDesc();
}
