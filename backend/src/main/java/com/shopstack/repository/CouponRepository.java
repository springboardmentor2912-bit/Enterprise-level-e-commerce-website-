package com.shopstack.repository;

import com.shopstack.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    List<Coupon> findByActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT c FROM Coupon c WHERE c.active = true AND (c.startDate IS NULL OR c.startDate <= :now) AND (c.expiryDate IS NULL OR c.expiryDate >= :now)")
    List<Coupon> findCurrentlyValidCoupons(LocalDateTime now);

    long countByActiveTrue();
}
