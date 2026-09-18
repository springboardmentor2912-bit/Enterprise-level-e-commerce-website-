package com.infosys.auth.service;

import com.infosys.auth.model.Coupon;
import com.infosys.auth.model.CouponUsage;
import com.infosys.auth.repository.CouponRepository;
import com.infosys.auth.repository.CouponUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @InjectMocks
    private CouponService couponService;

    private Coupon percentageCoupon;
    private Coupon flatCoupon;

    @BeforeEach
    void setUp() {
        percentageCoupon = new Coupon();
        percentageCoupon.setId(1L);
        percentageCoupon.setCode("SAVE20");
        percentageCoupon.setDescription("Get 20% off on orders above ₹1,000");
        percentageCoupon.setDiscountType("PERCENTAGE");
        percentageCoupon.setDiscountValue(new BigDecimal("20"));
        percentageCoupon.setMinOrderAmount(new BigDecimal("1000"));
        percentageCoupon.setMaxDiscountAmount(new BigDecimal("500"));
        percentageCoupon.setStartDate(LocalDateTime.now().minusDays(1));
        percentageCoupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        percentageCoupon.setUsageLimit(100);
        percentageCoupon.setUsedCount(0);
        percentageCoupon.setActive(true);

        flatCoupon = new Coupon();
        flatCoupon.setId(2L);
        flatCoupon.setCode("FLAT200");
        flatCoupon.setDescription("Flat ₹200 off on orders above ₹1,500");
        flatCoupon.setDiscountType("FLAT_AMOUNT");
        flatCoupon.setDiscountValue(new BigDecimal("200"));
        flatCoupon.setMinOrderAmount(new BigDecimal("1500"));
        flatCoupon.setMaxDiscountAmount(null);
        flatCoupon.setStartDate(LocalDateTime.now().minusDays(1));
        flatCoupon.setExpiryDate(LocalDateTime.now().plusDays(60));
        flatCoupon.setUsageLimit(50);
        flatCoupon.setUsedCount(0);
        flatCoupon.setActive(true);
    }

    @Test
    @DisplayName("Case 1: Cart ₹2,000 with SAVE20 (20%) → Discount ₹400, Final ₹1,600")
    void testPercentageDiscountWithinCap() {
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        Map<String, Object> result = couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("2000"));

        assertTrue((Boolean) result.get("valid"));
        assertEquals(0, new BigDecimal("400.00").compareTo((BigDecimal) result.get("discountAmount")));
        assertEquals(0, new BigDecimal("1600.00").compareTo((BigDecimal) result.get("finalAmount")));
    }

    @Test
    @DisplayName("Case 2: Cart ₹5,000 with SAVE20 (20%) → Capped at ₹500, Final ₹4,500")
    void testPercentageDiscountHitsMaxCap() {
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        Map<String, Object> result = couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("5000"));

        assertTrue((Boolean) result.get("valid"));
        assertEquals(0, new BigDecimal("500.00").compareTo((BigDecimal) result.get("discountAmount")));
        assertEquals(0, new BigDecimal("4500.00").compareTo((BigDecimal) result.get("finalAmount")));
    }

    @Test
    @DisplayName("Case 3: Cart ₹2,000 with FLAT200 → Discount ₹200, Final ₹1,800")
    void testFlatDiscountCalculation() {
        when(couponRepository.findByCodeIgnoreCase("FLAT200")).thenReturn(Optional.of(flatCoupon));

        Map<String, Object> result = couponService.validateAndCalculateDiscount("FLAT200", new BigDecimal("2000"));

        assertTrue((Boolean) result.get("valid"));
        assertEquals(0, new BigDecimal("200.00").compareTo((BigDecimal) result.get("discountAmount")));
        assertEquals(0, new BigDecimal("1800.00").compareTo((BigDecimal) result.get("finalAmount")));
    }

    @Test
    @DisplayName("Case 4: Cart below minimum order amount → Throws exception")
    void testMinOrderAmountFailure() {
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("500")));

        assertTrue(ex.getMessage().contains("Minimum order amount"));
    }

    @Test
    @DisplayName("Case 5: Expired coupon → Throws exception")
    void testExpiredCouponFailure() {
        percentageCoupon.setExpiryDate(LocalDateTime.now().minusDays(1));
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("2000")));

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    @DisplayName("Case 6: Inactive coupon → Throws exception")
    void testInactiveCouponFailure() {
        percentageCoupon.setActive(false);
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("2000")));

        assertTrue(ex.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("Case 7: Usage limit reached → Throws exception")
    void testUsageLimitReachedFailure() {
        percentageCoupon.setUsedCount(100);
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> couponService.validateAndCalculateDiscount("SAVE20", new BigDecimal("2000")));

        assertTrue(ex.getMessage().contains("maximum usage limit"));
    }

    @Test
    @DisplayName("Case 8: Non-existent coupon code → Throws exception")
    void testNonExistentCouponCode() {
        when(couponRepository.findByCodeIgnoreCase("INVALID")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> couponService.validateAndCalculateDiscount("INVALID", new BigDecimal("2000")));

        assertTrue(ex.getMessage().contains("does not exist"));
    }

    @Test
    @DisplayName("Case 9: Record coupon usage increments used count")
    void testRecordCouponUsage() {
        when(couponRepository.findByCodeIgnoreCase("SAVE20")).thenReturn(Optional.of(percentageCoupon));
        when(couponRepository.save(any(Coupon.class))).thenReturn(percentageCoupon);
        when(couponUsageRepository.save(any(CouponUsage.class))).thenAnswer(inv -> inv.getArgument(0));

        CouponUsage usage = couponService.recordCouponUsage(
                "SAVE20", 1L, "John", 100L,
                new BigDecimal("2000"), new BigDecimal("400"), new BigDecimal("1600")
        );

        assertNotNull(usage);
        assertEquals("SAVE20", usage.getCouponCode());
        assertEquals(1, percentageCoupon.getUsedCount());
        verify(couponRepository).save(percentageCoupon);
        verify(couponUsageRepository).save(any(CouponUsage.class));
    }
}
