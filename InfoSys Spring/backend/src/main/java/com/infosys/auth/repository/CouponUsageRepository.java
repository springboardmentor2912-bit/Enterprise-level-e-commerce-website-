package com.infosys.auth.repository;

import com.infosys.auth.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByCouponIdOrderByUsedAtDesc(Long couponId);

    List<CouponUsage> findByUserIdOrderByUsedAtDesc(Long userId);

    List<CouponUsage> findAllByOrderByUsedAtDesc();
}
