package com.infosys.springboard.authentication.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infosys.springboard.authentication.entity.Commission;

@Repository
public interface CommissionRepository
        extends JpaRepository<Commission, Long> {

    List<Commission> findByVendorEmail(String vendorEmail);

    List<Commission> findByOrderId(Long orderId);
}