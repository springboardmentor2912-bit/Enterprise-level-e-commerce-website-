package com.shopstack.repository;

import com.shopstack.entity.Vendor;
import com.shopstack.enums.VendorApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUserId(Long userId);
    org.springframework.data.domain.Page<Vendor> findByApprovalStatus(VendorApprovalStatus status, org.springframework.data.domain.Pageable pageable);
}
