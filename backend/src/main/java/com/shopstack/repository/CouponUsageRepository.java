package com.shopstack.repository;

import com.shopstack.model.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    long countByCouponId(Long couponId);

    long countByCouponIdAndUserId(Long couponId, Long userId);

    List<CouponUsage> findByCouponIdOrderByUsedAtDesc(Long couponId);

    List<CouponUsage> findByUserIdOrderByUsedAtDesc(Long userId);

    List<CouponUsage> findAllByOrderByUsedAtDesc();

    @Query("SELECT COALESCE(SUM(u.discountAmount), 0.0) FROM CouponUsage u")
    Double sumTotalDiscountsProvided();
}
