package com.javaenterprise.coupon.repository;

import com.javaenterprise.coupon.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    @Query("SELECT COALESCE(SUM(cu.discountAmount), 0) FROM CouponUsage cu WHERE cu.coupon.id = :couponId")
    BigDecimal findTotalDiscountByCouponId(@Param("couponId") Long couponId);
    void deleteByCouponId(Long couponId);
}