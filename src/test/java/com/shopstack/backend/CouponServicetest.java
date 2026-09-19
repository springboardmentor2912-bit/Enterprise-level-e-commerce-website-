package com.shopstack.backend.service;

import com.shopstack.backend.dto.ApplyCouponRequest;
import com.shopstack.backend.dto.CouponApplyResponse;
import com.shopstack.backend.entity.Cart;
import com.shopstack.backend.entity.CartItem;
import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.CouponStatus;
import com.shopstack.backend.enums.DiscountType;
import com.shopstack.backend.repository.CartRepository;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * Unit tests for CouponService.applyCoupon(), covering the example test
 * case from the Milestone 3 - Task 3 (Coupon and Promotion Engine) brief:
 *
 * Cart Amount ₹2,000, Coupon SAVE20 (20%) -> Discount ₹400, Final ₹1,600
 *
 * Plus the validation rules the brief calls out explicitly: existence,
 * active status, expiry, minimum order, usage limit, and product
 * eligibility against the customer's actual cart.
 */
@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    private static final String CUSTOMER_EMAIL = "customer@example.com";

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartRepository cartRepository;

    @InjectMocks
    private CouponService couponService;

    private User customer;
    private Product eligibleProduct;

    @BeforeEach
    void setUp() {

        customer = new User();
        customer.setId(1L);
        customer.setEmail(CUSTOMER_EMAIL);

        eligibleProduct = new Product();
        eligibleProduct.setId(10L);
        eligibleProduct.setName("Eligible Product");

        // Common stubs needed by every happy-path test. Marked lenient
        // because the not-found/invalid-code tests short-circuit before
        // ever reaching the cart lookup.
        lenient().when(userRepository.findByEmail(CUSTOMER_EMAIL))
                .thenReturn(Optional.of(customer));

        lenient().when(cartRepository.findByUser(customer))
                .thenReturn(Optional.of(buildCartWithProduct(eligibleProduct)));
    }

    private Cart buildCartWithProduct(Product product) {

        CartItem item = new CartItem();
        item.setProduct(product);
        item.setQuantity(1);

        Cart cart = new Cart();
        cart.setUser(customer);
        cart.setItems(List.of(item));
        return cart;
    }

    private Coupon buildApprovedCoupon(
            String code,
            DiscountType type,
            Double value,
            Double minOrder,
            Double maxDiscount,
            Integer usageLimit,
            Integer usedCount
    ) {

        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDiscountType(type);
        coupon.setDiscountValue(value);
        coupon.setMinimumOrderAmount(minOrder);
        coupon.setMaximumDiscount(maxDiscount);
        coupon.setStartDate(LocalDateTime.now().minusDays(1));
        coupon.setExpiryDate(LocalDateTime.now().plusDays(30));
        coupon.setUsageLimit(usageLimit);
        coupon.setUsedCount(usedCount);
        coupon.setActive(true);
        coupon.setStatus(CouponStatus.APPROVED);
        coupon.setEligibleProducts(List.of(eligibleProduct));
        return coupon;
    }

    private ApplyCouponRequest buildRequest(String code, Double cartAmount) {

        ApplyCouponRequest request = new ApplyCouponRequest();
        request.setCouponCode(code);
        request.setCartAmount(cartAmount);
        return request;
    }

    // =========================================================
    // TASK DOC EXAMPLE: SAVE20 on ₹2,000 cart
    // =========================================================

    @Test
    void applyCoupon_save20OnTwoThousandCart() {

        Coupon coupon = buildApprovedCoupon(
                "SAVE20",
                DiscountType.PERCENTAGE,
                20.0,
                1000.0,
                null,
                null,
                0
        );

        when(couponRepository.findByCode("SAVE20"))
                .thenReturn(Optional.of(coupon));

        CouponApplyResponse response = couponService.applyCoupon(
                buildRequest("save20", 2000.0),
                CUSTOMER_EMAIL
        );

        assertEquals(400.0, response.getDiscountAmount());
        assertEquals(1600.0, response.getFinalAmount());
    }

    // =========================================================
    // FIXED DISCOUNT TYPE
    // =========================================================

    @Test
    void applyCoupon_fixedDiscount() {

        Coupon coupon = buildApprovedCoupon(
                "FIXED100",
                DiscountType.FIXED,
                100.0,
                null,
                null,
                null,
                0
        );

        when(couponRepository.findByCode("FIXED100"))
                .thenReturn(Optional.of(coupon));

        CouponApplyResponse response = couponService.applyCoupon(
                buildRequest("FIXED100", 500.0),
                CUSTOMER_EMAIL
        );

        assertEquals(100.0, response.getDiscountAmount());
        assertEquals(400.0, response.getFinalAmount());
    }

    // =========================================================
    // MAXIMUM DISCOUNT CAP
    // =========================================================

    @Test
    void applyCoupon_capsAtMaximumDiscount() {

        // 50% of ₹5,000 would be ₹2,500, but maxDiscount caps it at ₹500
        Coupon coupon = buildApprovedCoupon(
                "BIG50",
                DiscountType.PERCENTAGE,
                50.0,
                null,
                500.0,
                null,
                0
        );

        when(couponRepository.findByCode("BIG50"))
                .thenReturn(Optional.of(coupon));

        CouponApplyResponse response = couponService.applyCoupon(
                buildRequest("BIG50", 5000.0),
                CUSTOMER_EMAIL
        );

        assertEquals(500.0, response.getDiscountAmount());
        assertEquals(4500.0, response.getFinalAmount());
    }

    // =========================================================
    // DISCOUNT CANNOT EXCEED CART AMOUNT
    // =========================================================

    @Test
    void applyCoupon_fixedDiscountCannotExceedCart() {

        Coupon coupon = buildApprovedCoupon(
                "FIXED1000",
                DiscountType.FIXED,
                1000.0,
                null,
                null,
                null,
                0
        );

        when(couponRepository.findByCode("FIXED1000"))
                .thenReturn(Optional.of(coupon));

        CouponApplyResponse response = couponService.applyCoupon(
                buildRequest("FIXED1000", 300.0),
                CUSTOMER_EMAIL
        );

        assertEquals(300.0, response.getDiscountAmount());
        assertEquals(0.0, response.getFinalAmount());
    }

    // =========================================================
    // INVALID COUPON CODE
    // =========================================================

    @Test
    void applyCoupon_throwsWhenCouponDoesNotExist() {

        when(couponRepository.findByCode("NOPE"))
                .thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("NOPE", 1000.0),
                        CUSTOMER_EMAIL
                )
        );

        assertEquals("Invalid coupon code", exception.getMessage());
    }

    // =========================================================
    // NOT YET APPROVED BY VENDOR
    // =========================================================

    @Test
    void applyCoupon_throwsWhenNotApproved() {

        Coupon coupon = buildApprovedCoupon(
                "PENDING10",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                null,
                0
        );
        coupon.setStatus(CouponStatus.PENDING);

        when(couponRepository.findByCode("PENDING10"))
                .thenReturn(Optional.of(coupon));

        assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("PENDING10", 1000.0),
                        CUSTOMER_EMAIL
                )
        );
    }

    // =========================================================
    // PRODUCT NOT ELIGIBLE FOR THIS COUPON
    // =========================================================

    @Test
    void applyCoupon_throwsWhenCartHasNoEligibleProduct() {

        Product otherProduct = new Product();
        otherProduct.setId(99L);
        otherProduct.setName("Different Product");

        Coupon coupon = buildApprovedCoupon(
                "SHOEONLY",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                null,
                0
        );
        // Coupon is only valid for a product NOT in the customer's cart
        coupon.setEligibleProducts(List.of(otherProduct));

        when(couponRepository.findByCode("SHOEONLY"))
                .thenReturn(Optional.of(coupon));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("SHOEONLY", 1000.0),
                        CUSTOMER_EMAIL
                )
        );

        assertEquals(
                "This coupon is not applicable to the products in your cart",
                exception.getMessage()
        );
    }

    // =========================================================
    // INACTIVE COUPON
    // =========================================================

    @Test
    void applyCoupon_throwsWhenInactive() {

        Coupon coupon = buildApprovedCoupon(
                "OFF10",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                null,
                0
        );
        coupon.setActive(false);

        when(couponRepository.findByCode("OFF10"))
                .thenReturn(Optional.of(coupon));

        assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("OFF10", 1000.0),
                        CUSTOMER_EMAIL
                )
        );
    }

    // =========================================================
    // NOT YET STARTED
    // =========================================================

    @Test
    void applyCoupon_throwsWhenNotYetStarted() {

        Coupon coupon = buildApprovedCoupon(
                "FUTURE10",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                null,
                0
        );
        coupon.setStartDate(LocalDateTime.now().plusDays(5));

        when(couponRepository.findByCode("FUTURE10"))
                .thenReturn(Optional.of(coupon));

        assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("FUTURE10", 1000.0),
                        CUSTOMER_EMAIL
                )
        );
    }

    // =========================================================
    // EXPIRED COUPON
    // =========================================================

    @Test
    void applyCoupon_throwsWhenExpired() {

        Coupon coupon = buildApprovedCoupon(
                "OLD10",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                null,
                0
        );
        coupon.setExpiryDate(LocalDateTime.now().minusDays(1));

        when(couponRepository.findByCode("OLD10"))
                .thenReturn(Optional.of(coupon));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("OLD10", 1000.0),
                        CUSTOMER_EMAIL
                )
        );

        assertEquals("Coupon has expired", exception.getMessage());
    }

    // =========================================================
    // USAGE LIMIT REACHED
    // =========================================================

    @Test
    void applyCoupon_throwsWhenUsageLimitReached() {

        Coupon coupon = buildApprovedCoupon(
                "LIMIT5",
                DiscountType.PERCENTAGE,
                10.0,
                null,
                null,
                5,
                5
        );

        when(couponRepository.findByCode("LIMIT5"))
                .thenReturn(Optional.of(coupon));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("LIMIT5", 1000.0),
                        CUSTOMER_EMAIL
                )
        );

        assertEquals("Coupon usage limit reached", exception.getMessage());
    }

    // =========================================================
    // BELOW MINIMUM ORDER AMOUNT
    // =========================================================

    @Test
    void applyCoupon_throwsWhenBelowMinimumOrder() {

        Coupon coupon = buildApprovedCoupon(
                "MIN1000",
                DiscountType.PERCENTAGE,
                10.0,
                1000.0,
                null,
                null,
                0
        );

        when(couponRepository.findByCode("MIN1000"))
                .thenReturn(Optional.of(coupon));

        assertThrows(
                RuntimeException.class,
                () -> couponService.applyCoupon(
                        buildRequest("MIN1000", 500.0),
                        CUSTOMER_EMAIL
                )
        );
    }
}