package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.model.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByVendorId(Long vendorId);
    List<Settlement> findByVendorIdOrderByIdDesc(Long vendorId);
    List<Settlement> findByOrderId(String orderId);
    List<Settlement> findAllByOrderByIdDesc();
}
