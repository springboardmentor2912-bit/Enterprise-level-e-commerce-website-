package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    List<Coupon> findByVendor(User vendor);

    List<Coupon> findByVendorAndStatus(
            User vendor,
            CouponStatus status
    );

    List<Coupon> findByStatus(CouponStatus status);
}