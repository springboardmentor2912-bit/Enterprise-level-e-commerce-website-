package shopstack_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import shopstack_backend.entity.Coupon;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Coupon> findAllByOrderByCreatedAtDesc();

    // Coupons that are currently usable by *someone* right now: active,
    // within their date window, and still under their usage limit.
    // Whether a given customer's order actually qualifies (min order
    // amount) is checked separately per-order in CouponService.
    @Query("SELECT c FROM Coupon c WHERE c.active = true " +
           "AND c.startDate <= :today AND c.expiryDate >= :today " +
           "AND (c.usageLimit IS NULL OR c.usageCount < c.usageLimit) " +
           "ORDER BY c.discountValue DESC")
    List<Coupon> findCurrentlyValidCoupons(@Param("today") LocalDate today);

    // Atomically increments usageCount only if the coupon still has room
    // under its usage limit. Returns the number of rows updated (0 or 1) —
    // 0 means someone else used up the last slot in the meantime.
    @Modifying
    @Query("UPDATE Coupon c SET c.usageCount = c.usageCount + 1 " +
           "WHERE c.id = :id AND (c.usageLimit IS NULL OR c.usageCount < c.usageLimit)")
    int incrementUsage(@Param("id") Long id);
}