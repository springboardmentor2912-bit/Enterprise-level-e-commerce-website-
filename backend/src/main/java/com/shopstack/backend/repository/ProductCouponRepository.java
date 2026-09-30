package com.shopstack.backend.repository;

import com.shopstack.backend.model.ProductCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCouponRepository extends JpaRepository<ProductCoupon, Long> {
    Optional<ProductCoupon> findByProductIdAndCouponCodeIgnoreCase(Long productId, String couponCode);
    List<ProductCoupon> findByCouponCodeIgnoreCase(String couponCode);
    List<ProductCoupon> findByProductId(Long productId);
    void deleteByProductIdAndCouponCodeIgnoreCase(Long productId, String couponCode);
    void deleteByCouponCodeIgnoreCase(String couponCode);
}
