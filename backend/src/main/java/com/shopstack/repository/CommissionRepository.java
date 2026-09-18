package com.shopstack.repository;

import com.shopstack.model.Commission;
import com.shopstack.model.CommissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {

    Optional<Commission> findByOrderId(Long orderId);

    Optional<Commission> findByOrderOrderNumber(String orderNumber);

    List<Commission> findByVendorProfileIdOrderByCreatedAtDesc(Long vendorProfileId);

    List<Commission> findByStatusOrderByCreatedAtDesc(CommissionStatus status);

    List<Commission> findAllByOrderByCreatedAtDesc();

    List<Commission> findByVendorProfileIdAndStatusOrderByCreatedAtDesc(Long vendorProfileId, CommissionStatus status);

    @Query("SELECT COALESCE(SUM(c.commissionAmount), 0.0) FROM Commission c WHERE c.status != 'CANCELLED'")
    Double calculateTotalCommissionEarned();

    @Query("SELECT COALESCE(SUM(c.vendorAmount), 0.0) FROM Commission c WHERE c.status != 'CANCELLED'")
    Double calculateTotalVendorPayouts();

    @Query("SELECT COALESCE(SUM(c.orderAmount), 0.0) FROM Commission c WHERE c.status != 'CANCELLED'")
    Double calculateTotalGrossSales();

    @Query("SELECT COALESCE(SUM(c.commissionAmount), 0.0) FROM Commission c WHERE c.vendorProfile.id = :vendorId AND c.status != 'CANCELLED'")
    Double calculateVendorCommissionEarned(@Param("vendorId") Long vendorId);

    @Query("SELECT COALESCE(SUM(c.vendorAmount), 0.0) FROM Commission c WHERE c.vendorProfile.id = :vendorId AND c.status != 'CANCELLED'")
    Double calculateVendorNetPayout(@Param("vendorId") Long vendorId);

    @Query("SELECT COALESCE(SUM(c.orderAmount), 0.0) FROM Commission c WHERE c.vendorProfile.id = :vendorId AND c.status != 'CANCELLED'")
    Double calculateVendorGrossSales(@Param("vendorId") Long vendorId);
}
