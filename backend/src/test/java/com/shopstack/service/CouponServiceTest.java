package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.model.*;
import com.shopstack.repository.CouponRepository;
import com.shopstack.repository.CouponUsageRepository;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
    "razorpay.key_id=rzp_test_mockkey123456",
    "razorpay.key_secret=mocksecretkey1234567890123456789"
})
@Transactional
class CouponServiceTest {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User sampleCustomer;
    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleCustomer = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No customer found in test DB"));

        sampleOrder = orderRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No order found in test DB"));
    }

    @Test
    @DisplayName("Case 1: Validate Percentage Discount (Cart ₹2,000 with SAVE20 (20%) -> Discount ₹400, Final ₹1,600)")
    void testValidateCoupon_Percentage_Success() {
        double cartAmount = 2000.0;
        CouponValidationResponse response = couponService.validateCoupon("SAVE20", cartAmount, sampleCustomer.getId());

        assertNotNull(response);
        assertTrue(response.isValid(), "SAVE20 should be valid for ₹2,000 order");
        assertEquals("SAVE20", response.getCouponCode());
        assertEquals(DiscountType.PERCENTAGE, response.getDiscountType());
        assertEquals(20.0, response.getDiscountValue(), 0.001);
        assertEquals(400.0, response.getDiscountAmount(), 0.001, "20% of ₹2,000 must be ₹400.00");
        assertEquals(1600.0, response.getFinalAmount(), 0.001, "Final amount must be ₹1,600.00");
    }

    @Test
    @DisplayName("Case 2: Validate Fixed Amount Discount (Cart ₹2,500 with FESTIVE500 -> Discount ₹500, Final ₹2,000)")
    void testValidateCoupon_FixedAmount_Success() {
        double cartAmount = 2500.0;
        CouponValidationResponse response = couponService.validateCoupon("FESTIVE500", cartAmount, sampleCustomer.getId());

        assertNotNull(response);
        assertTrue(response.isValid(), "FESTIVE500 should be valid for ₹2,500 order");
        assertEquals("FESTIVE500", response.getCouponCode());
        assertEquals(DiscountType.FIXED_AMOUNT, response.getDiscountType());
        assertEquals(500.0, response.getDiscountAmount(), 0.001, "Discount must be flat ₹500.00");
        assertEquals(2000.0, response.getFinalAmount(), 0.001, "Final amount must be ₹2,000.00");
    }

    @Test
    @DisplayName("Case 3: Minimum Order Amount Not Satisfied (Cart ₹500 with SAVE20 requiring min ₹1,000)")
    void testValidateCoupon_MinOrderAmountNotMet() {
        double cartAmount = 500.0;
        CouponValidationResponse response = couponService.validateCoupon("SAVE20", cartAmount, sampleCustomer.getId());

        assertNotNull(response);
        assertFalse(response.isValid(), "Coupon should be rejected when order total is below minimum");
        assertTrue(response.getMessage().toLowerCase().contains("minimum order amount"));
        assertEquals(0.0, response.getDiscountAmount(), 0.001);
    }

    @Test
    @DisplayName("Case 4: Expired Coupon Rejected (EXPIRED15)")
    void testValidateCoupon_Expired() {
        double cartAmount = 1000.0;
        CouponValidationResponse response = couponService.validateCoupon("EXPIRED15", cartAmount, sampleCustomer.getId());

        assertNotNull(response);
        assertFalse(response.isValid(), "Expired coupon must be rejected");
        assertTrue(response.getMessage().toLowerCase().contains("expired"));
    }

    @Test
    @DisplayName("Case 5: Inactive Coupon Rejected")
    void testValidateCoupon_Inactive() {
        Coupon testInactive = Coupon.builder()
                .code("INACTIVE99")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(50.0)
                .minOrderAmount(100.0)
                .active(false)
                .build();
        couponRepository.save(testInactive);

        CouponValidationResponse response = couponService.validateCoupon("INACTIVE99", 500.0, sampleCustomer.getId());

        assertNotNull(response);
        assertFalse(response.isValid(), "Inactive coupon must be rejected");
        assertTrue(response.getMessage().toLowerCase().contains("inactive"));
    }

    @Test
    @DisplayName("Case 6: Maximum Discount Cap (Cart ₹10,000 with SAVE20 capped at ₹1,000)")
    void testValidateCoupon_MaxDiscountCap() {
        double cartAmount = 10000.0; // 20% of 10,000 is 2,000, but capped at 1,000
        CouponValidationResponse response = couponService.validateCoupon("SAVE20", cartAmount, sampleCustomer.getId());

        assertNotNull(response);
        assertTrue(response.isValid());
        assertEquals(1000.0, response.getDiscountAmount(), 0.001, "Discount should be capped at ₹1,000.00");
        assertEquals(9000.0, response.getFinalAmount(), 0.001, "Final amount should be ₹9,000.00");
    }

    @Test
    @DisplayName("Case 7: Global Usage Limit Enforcement")
    void testValidateCoupon_GlobalUsageLimitReached() {
        Coupon limited = Coupon.builder()
                .code("LIMITREACHED")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(50.0)
                .usageLimit(2)
                .usageCount(2)
                .active(true)
                .build();
        couponRepository.save(limited);

        CouponValidationResponse response = couponService.validateCoupon("LIMITREACHED", 500.0, sampleCustomer.getId());

        assertNotNull(response);
        assertFalse(response.isValid(), "Coupon with usageCount >= usageLimit must be rejected");
        assertTrue(response.getMessage().toLowerCase().contains("limit has been reached"));
    }

    @Test
    @DisplayName("Case 8: Per-User Usage Limit Enforcement")
    void testValidateCoupon_PerUserUsageLimitReached() {
        Coupon singleUse = Coupon.builder()
                .code("SINGLEUSE10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .userUsageLimit(1)
                .active(true)
                .build();
        Coupon saved = couponRepository.save(singleUse);

        // Record 1 usage for sampleCustomer
        CouponUsage usage = CouponUsage.builder()
                .coupon(saved)
                .user(sampleCustomer)
                .order(sampleOrder)
                .orderAmount(500.0)
                .discountAmount(50.0)
                .finalAmount(450.0)
                .usedAt(LocalDateTime.now())
                .build();
        couponUsageRepository.save(usage);

        CouponValidationResponse response = couponService.validateCoupon("SINGLEUSE10", 500.0, sampleCustomer.getId());

        assertNotNull(response);
        assertFalse(response.isValid(), "Per-user limit exceeded must reject coupon");
        assertTrue(response.getMessage().toLowerCase().contains("already redeemed"));
    }

    @Test
    @DisplayName("Case 9: Coupon CRUD & Status Toggle Lifecycle")
    void testCouponCrudAndToggle() {
        CouponRequest req = new CouponRequest();
        req.setCode("SUMMER30");
        req.setDescription("Summer 30% mega sale");
        req.setDiscountType(DiscountType.PERCENTAGE);
        req.setDiscountValue(30.0);
        req.setMinOrderAmount(1500.0);
        req.setMaxDiscountAmount(600.0);
        req.setActive(true);

        CouponResponse created = couponService.createCoupon(req);
        assertNotNull(created.getId());
        assertEquals("SUMMER30", created.getCode());
        assertTrue(created.getActive());

        // Toggle status
        CouponResponse toggled = couponService.toggleCouponStatus(created.getId());
        assertFalse(toggled.getActive(), "Status should be flipped to inactive");

        // Delete
        couponService.deleteCoupon(created.getId());
        assertFalse(couponRepository.existsByCodeIgnoreCase("SUMMER30"));
    }

    @Test
    @DisplayName("Case 10: Coupon Analytics Summary & Usage Audit Logs")
    void testCouponAnalytics() {
        CouponAnalyticsSummary summary = couponService.getCouponAnalytics();

        assertNotNull(summary);
        assertTrue(summary.getTotalCoupons() >= 4);
        assertTrue(summary.getTotalRedemptions() >= 1);
        assertTrue(summary.getTotalDiscountsGiven() > 0);
        assertNotNull(summary.getTopPerformingCoupons());

        List<CouponUsageResponse> logs = couponService.getAllUsageLogs();
        assertNotNull(logs);
        assertFalse(logs.isEmpty());
        assertNotNull(logs.get(0).getCouponCode());
    }
}
