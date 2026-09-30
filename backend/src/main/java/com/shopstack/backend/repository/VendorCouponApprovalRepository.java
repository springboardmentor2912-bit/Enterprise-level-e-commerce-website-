package com.shopstack.backend.repository;

import com.shopstack.backend.model.VendorCouponApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorCouponApprovalRepository extends JpaRepository<VendorCouponApproval, Long> {
    Optional<VendorCouponApproval> findByVendorIdAndCouponCodeIgnoreCase(Long vendorId, String couponCode);
    List<VendorCouponApproval> findByVendorId(Long vendorId);
    List<VendorCouponApproval> findByCouponCodeIgnoreCase(String couponCode);
}
