package com.infosys.auth.repository;

import com.infosys.auth.model.VendorCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorCommissionRepository extends JpaRepository<VendorCommission, Long> {

    List<VendorCommission> findByOrderId(Long orderId);

    List<VendorCommission> findByVendorId(Long vendorId);

    List<VendorCommission> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    List<VendorCommission> findAllByOrderByCreatedAtDesc();

    boolean existsByOrderIdAndVendorId(Long orderId, Long vendorId);
}
