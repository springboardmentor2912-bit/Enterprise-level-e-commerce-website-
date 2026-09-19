package com.shopstack.backend.repository;

import com.shopstack.backend.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CouponUsageRepository
        extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByCouponId(Long couponId);

    List<CouponUsage> findByCustomerId(Long customerId);

    List<CouponUsage> findByOrderId(Long orderId);
}