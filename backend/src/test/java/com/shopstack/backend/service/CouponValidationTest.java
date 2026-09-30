package com.shopstack.backend.service;

import com.shopstack.backend.model.Coupon;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.VendorCouponApproval;
import com.shopstack.backend.model.ProductCoupon;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.CouponUsageRepository;
import com.shopstack.backend.repository.ProductCouponRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorCouponApprovalRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CouponValidationTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponUsageRepository couponUsageRepository;

    @Mock
    private VendorCouponApprovalRepository vendorCouponApprovalRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductCouponRepository productCouponRepository;

    @InjectMocks
    private CouponService couponService;

    @Test
    public void testCouponValidation_AllowsSameDayWithTimezoneDisparity() {
        // Given a coupon created for current day but 5.5 hours ahead of server UTC clock
        LocalDateTime couponStart = LocalDateTime.now().plusHours(5).plusMinutes(30);
        LocalDateTime couponExpiry = LocalDateTime.now().plusDays(7);

        Coupon coupon = new Coupon("SAVE25", "PERCENTAGE", 25.0, 1000.0, null, couponStart, couponExpiry, null);
        coupon.setActive(true);

        when(couponRepository.findByCodeIgnoreCase("SAVE25")).thenReturn(Optional.of(coupon));

        Product product = new Product();
        product.setId(101L);
        product.setName("Apple watch series 11");
        product.setPrice(56999.05);
        product.setCouponsEnabled(true);
        product.setVendorId(2L);

        when(productRepository.findById(101L)).thenReturn(Optional.of(product));
        when(vendorCouponApprovalRepository.findByVendorIdAndCouponCodeIgnoreCase(2L, "SAVE25"))
                .thenReturn(Optional.of(new VendorCouponApproval(2L, "SAVE25", "APPROVED")));
        when(productCouponRepository.findByProductIdAndCouponCodeIgnoreCase(101L, "SAVE25"))
                .thenReturn(Optional.of(new ProductCoupon(101L, "SAVE25")));

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> item = new HashMap<>();
        item.put("id", 101L);
        item.put("quantity", 1);
        item.put("price", 56999.05);
        items.add(item);

        Map<String, Object> result = couponService.validateAndCalculateDiscount("SAVE25", items, 1L);

        assertNotNull(result);
        assertTrue((Boolean) result.get("valid"), "Coupon should be valid even when server is in UTC and client in IST");
        assertEquals(14249.76, (Double) result.get("discountAmount"), 0.01);
    }
}
