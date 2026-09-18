package com.shopstack.repository;

import com.shopstack.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Coupon> findByActiveTrueOrderByCreatedAtDesc();

    List<Coupon> findAllByOrderByCreatedAtDesc();
}
