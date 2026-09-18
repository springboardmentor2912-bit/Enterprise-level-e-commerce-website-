package com.shopstack.service;

import com.shopstack.dto.*;
import com.shopstack.entity.Coupon;
import com.shopstack.entity.Customer;
import com.shopstack.entity.DiscountType;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.CouponRepository;
import com.shopstack.repository.CouponUsageRepository;
import com.shopstack.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final CustomerRepository customerRepository;

    public CouponServiceImpl(CouponRepository couponRepository,
                             CouponUsageRepository couponUsageRepository,
                             CustomerRepository customerRepository) {
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CouponDTO createCoupon(CreateCouponRequest request) {
        String cleanCode = request.getCode().trim().toUpperCase();
        if (couponRepository.existsByCode(cleanCode)) {
            throw new RuntimeException("Coupon code already exists: " + cleanCode);
        }

        Coupon coupon = new Coupon();
        coupon.setCode(cleanCode);
        coupon.setDescription(request.getDescription());
        coupon.setDiscountType(request.getDiscountType());
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setActive(request.getActive() != null ? request.getActive() : true);
        coupon.setCampaignName(request.getCampaignName());

        Coupon saved = couponRepository.save(coupon);
        return new CouponDTO(saved);
    }

    @Override
    @Transactional
    public CouponDTO updateCoupon(Long id, CreateCouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));

        if (request.getCode() != null && !request.getCode().isBlank()) {
            String cleanCode = request.getCode().trim().toUpperCase();
            if (!cleanCode.equalsIgnoreCase(coupon.getCode()) && couponRepository.existsByCode(cleanCode)) {
                throw new RuntimeException("Coupon code already exists: " + cleanCode);
            }
            coupon.setCode(cleanCode);
        }

        if (request.getDescription() != null) coupon.setDescription(request.getDescription());
        if (request.getDiscountType() != null) coupon.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) coupon.setDiscountValue(request.getDiscountValue());
        if (request.getMinOrderAmount() != null) coupon.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscount() != null) coupon.setMaxDiscount(request.getMaxDiscount());
        if (request.getStartDate() != null) coupon.setStartDate(request.getStartDate());
        if (request.getExpiryDate() != null) coupon.setExpiryDate(request.getExpiryDate());
        if (request.getUsageLimit() != null) coupon.setUsageLimit(request.getUsageLimit());
        if (request.getActive() != null) coupon.setActive(request.getActive());
        if (request.getCampaignName() != null) coupon.setCampaignName(request.getCampaignName());

        return new CouponDTO(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new ResourceNotFoundException("Coupon not found with ID: " + id);
        }
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional
    public CouponDTO toggleCouponStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        coupon.setActive(!coupon.isActive());
        return new CouponDTO(couponRepository.save(coupon));
    }

    @Override
    @Transactional(readOnly = true)
    public CouponDTO getCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with ID: " + id));
        return new CouponDTO(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponDTO getCouponByCode(String code) {
        Coupon coupon = couponRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));
        return new CouponDTO(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getActivePublicCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponRepository.findCurrentlyValidCoupons(now).stream()
                .filter(c -> c.getUsageLimit() == null || c.getUsedCount() < c.getUsageLimit())
                .map(CouponDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyCouponResponse validateAndCalculateDiscount(String code, BigDecimal cartTotal, String customerEmail) {
        if (code == null || code.isBlank()) {
            return new ApplyCouponResponse(false, "Coupon code is required.", null, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        String cleanCode = code.trim().toUpperCase();
        Coupon coupon = couponRepository.findByCode(cleanCode).orElse(null);

        if (coupon == null) {
            return new ApplyCouponResponse(false, "Invalid coupon code: " + cleanCode, cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        if (!coupon.isActive()) {
            return new ApplyCouponResponse(false, "This coupon is currently inactive.", cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            return new ApplyCouponResponse(false, "This coupon promotion has not started yet.", cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        if (coupon.getExpiryDate() != null && now.isAfter(coupon.getExpiryDate())) {
            return new ApplyCouponResponse(false, "This coupon has expired.", cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            return new ApplyCouponResponse(false, "Coupon usage limit has been reached.", cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        if (coupon.getMinOrderAmount() != null && cartTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            return new ApplyCouponResponse(false, "Minimum order amount of ₹" + coupon.getMinOrderAmount() + " required to use this coupon.", cleanCode, cartTotal, BigDecimal.ZERO, cartTotal);
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (DiscountType.FIXED.equals(coupon.getDiscountType())) {
            discount = coupon.getDiscountValue();
            if (discount.compareTo(cartTotal) > 0) {
                discount = cartTotal;
            }
        } else if (DiscountType.PERCENTAGE.equals(coupon.getDiscountType())) {
            discount = cartTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0 && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        }

        BigDecimal netTotal = cartTotal.subtract(discount);
        if (netTotal.compareTo(BigDecimal.ZERO) < 0) {
            netTotal = BigDecimal.ZERO;
        }

        return new ApplyCouponResponse(true, "Coupon applied successfully!", cleanCode, cartTotal, discount, netTotal);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponAnalyticsDTO getCouponAnalytics() {
        long totalCoupons = couponRepository.count();
        long activeCoupons = couponRepository.countByActiveTrue();
        long totalRedemptions = couponUsageRepository.count();

        BigDecimal totalDiscountGiven = couponUsageRepository.sumTotalDiscountGiven();
        if (totalDiscountGiven == null) totalDiscountGiven = BigDecimal.ZERO;

        BigDecimal totalRevenueWithCoupons = couponUsageRepository.sumTotalRevenueWithCoupons();
        if (totalRevenueWithCoupons == null) totalRevenueWithCoupons = BigDecimal.ZERO;

        return new CouponAnalyticsDTO(totalCoupons, activeCoupons, totalRedemptions, totalDiscountGiven, totalRevenueWithCoupons);
    }
}
