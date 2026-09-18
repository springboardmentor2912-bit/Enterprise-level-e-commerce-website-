package com.shopstack.repository;

import com.shopstack.entity.CouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    List<CouponUsage> findByCouponId(Long couponId);

    List<CouponUsage> findByCustomerId(Long customerId);

    long countByCouponId(Long couponId);

    long countByCouponIdAndCustomerId(Long couponId, Long customerId);

    @Query("SELECT SUM(cu.discountAmount) FROM CouponUsage cu")
    BigDecimal sumTotalDiscountGiven();

    @Query("SELECT SUM(o.totalAmount) FROM CouponUsage cu JOIN cu.order o")
    BigDecimal sumTotalRevenueWithCoupons();
}
