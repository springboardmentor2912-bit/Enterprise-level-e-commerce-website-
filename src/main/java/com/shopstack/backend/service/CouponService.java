package com.shopstack.backend.service;

import com.shopstack.backend.dto.ApplyCouponRequest;
import com.shopstack.backend.dto.CouponApplyResponse;
import com.shopstack.backend.dto.CouponResponse;
import com.shopstack.backend.dto.CreateCouponRequest;
import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.CouponStatus;
import com.shopstack.backend.enums.DiscountType;
import com.shopstack.backend.enums.Role;
import com.shopstack.backend.repository.CartRepository;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.shopstack.backend.entity.Cart;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;


@Service
public class CouponService {

    private final CouponRepository couponRepository;

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    private final CartRepository cartRepository;

    public CouponService(
            CouponRepository couponRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            CartRepository cartRepository
    ) {

        this.couponRepository =
                couponRepository;

        this.userRepository =
                userRepository;

        this.productRepository =
                productRepository;

        this.cartRepository =
                cartRepository;

    }




    // =========================================================
    // ADMIN - CREATE COUPON
    // =========================================================

    public CouponResponse createCoupon(
            CreateCouponRequest request
    ) {

        // -----------------------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------------------

        if (request.getCode() == null ||
                request.getCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Coupon code is required"
            );
        }


        String code =
                request.getCode()
                        .trim()
                        .toUpperCase();


        // -----------------------------------------------------
        // DUPLICATE CHECK
        // -----------------------------------------------------

        if (couponRepository.existsByCode(code)) {

            throw new RuntimeException(
                    "Coupon code already exists"
            );
        }


        // -----------------------------------------------------
        // VENDOR VALIDATION
        // -----------------------------------------------------

        if (request.getVendorId() == null) {

            throw new RuntimeException(
                    "Vendor is required"
            );
        }


        User vendor =
                userRepository.findById(
                                request.getVendorId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        if (vendor.getRole() != Role.VENDOR) {

            throw new RuntimeException(
                    "Selected user is not a vendor"
            );
        }


        // -----------------------------------------------------
        // PRODUCT VALIDATION
        // -----------------------------------------------------

        if (request.getProductIds() == null ||
                request.getProductIds().isEmpty()) {

            throw new RuntimeException(
                    "At least one product is required"
            );
        }


        List<Product> products =
                new ArrayList<>();


        for (Long productId :
                request.getProductIds()) {

            Product product =
                    productRepository
                            .findById(productId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Product not found: "
                                                    + productId
                                    )
                            );


            // Product must belong to selected vendor

            if (product.getVendor() == null ||
                    !product.getVendor()
                            .getId()
                            .equals(vendor.getId())) {

                throw new RuntimeException(
                        "Product "
                                + product.getName()
                                + " does not belong to selected vendor"
                );
            }


            products.add(product);
        }


        // -----------------------------------------------------
        // DISCOUNT VALIDATION
        // -----------------------------------------------------

        if (request.getDiscountType() == null) {

            throw new RuntimeException(
                    "Discount type is required"
            );
        }


        if (request.getDiscountValue() == null ||
                request.getDiscountValue() <= 0) {

            throw new RuntimeException(
                    "Discount value must be greater than 0"
            );
        }


        if (request.getDiscountType()
                == DiscountType.PERCENTAGE) {

            if (request.getDiscountValue() > 100) {

                throw new RuntimeException(
                        "Percentage discount cannot exceed 100%"
                );
            }
        }


        // -----------------------------------------------------
        // DATE VALIDATION
        // -----------------------------------------------------

        if (request.getStartDate() == null ||
                request.getExpiryDate() == null) {

            throw new RuntimeException(
                    "Start date and expiry date are required"
            );
        }


        if (request.getExpiryDate()
                .isBefore(
                        request.getStartDate()
                )) {

            throw new RuntimeException(
                    "Expiry date cannot be before start date"
            );
        }


        // -----------------------------------------------------
        // USAGE LIMIT
        // -----------------------------------------------------

        if (request.getUsageLimit() != null &&
                request.getUsageLimit() < 0) {

            throw new RuntimeException(
                    "Usage limit cannot be negative"
            );
        }


        // -----------------------------------------------------
        // CREATE COUPON
        // -----------------------------------------------------

        Coupon coupon =
                new Coupon();


        coupon.setCode(code);


        coupon.setVendor(vendor);


        coupon.setEligibleProducts(
                products
        );


        coupon.setDiscountType(
                request.getDiscountType()
        );


        coupon.setDiscountValue(
                request.getDiscountValue()
        );


        coupon.setMinimumOrderAmount(
                request.getMinimumOrderAmount()
        );


        coupon.setMaximumDiscount(
                request.getMaximumDiscount()
        );


        coupon.setStartDate(
                request.getStartDate()
        );


        coupon.setExpiryDate(
                request.getExpiryDate()
        );


        coupon.setUsageLimit(
                request.getUsageLimit()
        );


        coupon.setUsedCount(0);


        coupon.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : true
        );


        // -----------------------------------------------------
        // IMPORTANT
        // -----------------------------------------------------
        // Coupon starts as PENDING.
        // Vendor must approve it.

        coupon.setStatus(
                CouponStatus.PENDING
        );


        coupon.setCreatedAt(
                LocalDateTime.now()
        );


        Coupon savedCoupon =
                couponRepository.save(
                        coupon
                );


        return convertToResponse(
                savedCoupon
        );
    }


    // =========================================================
    // ADMIN - GET ALL COUPONS
    // =========================================================

    public List<CouponResponse> getAllCoupons() {

        return couponRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // ADMIN - GET COUPON BY ID
    // =========================================================

    public CouponResponse getCouponById(
            Long id
    ) {

        Coupon coupon =
                couponRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );


        return convertToResponse(
                coupon
        );
    }


    // =========================================================
    // CUSTOMER - APPLY COUPON
    // =========================================================

    public CouponApplyResponse applyCoupon(
            ApplyCouponRequest request,
            String email
    ) {

        // -----------------------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------------------

        if (request.getCouponCode() == null ||
                request.getCouponCode()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Coupon code is required"
            );
        }


        if (request.getCartAmount() == null ||
                request.getCartAmount() <= 0) {

            throw new RuntimeException(
                    "Cart amount must be greater than 0"
            );
        }


        String code =
                request.getCouponCode()
                        .trim()
                        .toUpperCase();


        // -----------------------------------------------------
        // FIND COUPON
        // -----------------------------------------------------

        Coupon coupon =
                couponRepository
                        .findByCode(code)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Invalid coupon code"
                                )
                        );


        // -----------------------------------------------------
        // CHECK VENDOR APPROVAL
        // -----------------------------------------------------

        if (coupon.getStatus()
                != CouponStatus.APPROVED) {

            throw new RuntimeException(
                    "Coupon has not been approved by the vendor"
            );
        }


        // -----------------------------------------------------
        // CHECK PRODUCT ELIGIBILITY
        // -----------------------------------------------------
        // Mirrors the check OrderService performs at order
        // placement, so a coupon that "applies" here never
        // fails later at checkout for a different reason.

        if (coupon.getEligibleProducts() == null ||
                coupon.getEligibleProducts().isEmpty()) {

            throw new RuntimeException(
                    "This coupon is not valid for any products"
            );
        }


        User customer =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                )
                        );


        Cart cart =
                cartRepository.findByUser(customer)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Cart not found"
                                )
                        );


        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new RuntimeException(
                    "Your cart is empty"
            );
        }


        boolean eligibleProductFound =
                cart.getItems()
                        .stream()
                        .anyMatch(cartItem ->

                                coupon.getEligibleProducts()
                                        .stream()
                                        .anyMatch(couponProduct ->

                                                couponProduct
                                                        .getId()
                                                        .equals(
                                                                cartItem
                                                                        .getProduct()
                                                                        .getId()
                                                        )
                                        )
                        );


        if (!eligibleProductFound) {

            throw new RuntimeException(
                    "This coupon is not applicable to the products in your cart"
            );
        }


        // -----------------------------------------------------
        // CHECK ACTIVE
        // -----------------------------------------------------

        if (!Boolean.TRUE.equals(
                coupon.getActive())) {

            throw new RuntimeException(
                    "Coupon is inactive"
            );
        }


        LocalDateTime now =
                LocalDateTime.now(ZoneId.of("Asia/Kolkata"));


        // -----------------------------------------------------
        // CHECK START DATE
        // -----------------------------------------------------

        if (now.isBefore(
                coupon.getStartDate())) {

            throw new RuntimeException(
                    "Coupon is not active yet"
            );
        }


        // -----------------------------------------------------
        // CHECK EXPIRY
        // -----------------------------------------------------

        if (now.isAfter(
                coupon.getExpiryDate())) {

            throw new RuntimeException(
                    "Coupon has expired"
            );
        }


        // -----------------------------------------------------
        // CHECK USAGE LIMIT
        // -----------------------------------------------------

        if (coupon.getUsageLimit() != null &&
                coupon.getUsedCount() >=
                        coupon.getUsageLimit()) {

            throw new RuntimeException(
                    "Coupon usage limit reached"
            );
        }


        // -----------------------------------------------------
        // MINIMUM ORDER
        // -----------------------------------------------------

        Double cartAmount =
                request.getCartAmount();


        if (coupon.getMinimumOrderAmount() != null &&
                cartAmount <
                        coupon.getMinimumOrderAmount()) {

            throw new RuntimeException(
                    "Minimum order amount is ₹"
                            + coupon.getMinimumOrderAmount()
            );
        }


        // -----------------------------------------------------
        // CALCULATE DISCOUNT
        // -----------------------------------------------------

        Double discountAmount;


        if (coupon.getDiscountType()
                == DiscountType.PERCENTAGE) {

            discountAmount =
                    cartAmount *
                            coupon.getDiscountValue()
                            / 100.0;

        } else {

            discountAmount =
                    coupon.getDiscountValue();
        }


        // -----------------------------------------------------
        // MAXIMUM DISCOUNT
        // -----------------------------------------------------

        if (coupon.getMaximumDiscount() != null &&
                discountAmount >
                        coupon.getMaximumDiscount()) {

            discountAmount =
                    coupon.getMaximumDiscount();
        }


        // -----------------------------------------------------
        // DISCOUNT CANNOT EXCEED CART
        // -----------------------------------------------------

        if (discountAmount > cartAmount) {

            discountAmount =
                    cartAmount;
        }


        // -----------------------------------------------------
        // ROUND
        // -----------------------------------------------------

        discountAmount =
                Math.round(
                        discountAmount * 100.0
                ) / 100.0;


        Double finalAmount =
                cartAmount -
                        discountAmount;


        finalAmount =
                Math.round(
                        finalAmount * 100.0
                ) / 100.0;


        return new CouponApplyResponse(
                coupon.getCode(),
                cartAmount,
                discountAmount,
                finalAmount,
                "Coupon applied successfully"
        );
    }


    // =========================================================
    // CONVERT ENTITY → RESPONSE
    // =========================================================

    private CouponResponse convertToResponse(
            Coupon coupon
    ) {

        CouponResponse response =
                new CouponResponse(
                        coupon.getId(),
                        coupon.getCode(),
                        coupon.getDiscountType(),
                        coupon.getDiscountValue(),
                        coupon.getMinimumOrderAmount(),
                        coupon.getMaximumDiscount(),
                        coupon.getStartDate(),
                        coupon.getExpiryDate(),
                        coupon.getUsageLimit(),
                        coupon.getUsedCount(),
                        coupon.getActive()
                );


        // -----------------------------------------------------
        // VENDOR INFORMATION
        // -----------------------------------------------------

        if (coupon.getVendor() != null) {

            response.setVendorId(
                    coupon.getVendor().getId()
            );

            response.setVendorName(
                    coupon.getVendor().getName()
            );
        }


        // -----------------------------------------------------
        // APPROVAL STATUS
        // -----------------------------------------------------

        response.setStatus(
                coupon.getStatus()
        );


        // -----------------------------------------------------
        // ELIGIBLE PRODUCTS
        // -----------------------------------------------------

        if (coupon.getEligibleProducts() != null) {

            response.setProductIds(
                    coupon.getEligibleProducts()
                            .stream()
                            .map(Product::getId)
                            .collect(Collectors.toList())
            );
        }


        return response;
    }


    // =========================================================
    // VENDOR - GET THEIR COUPONS
    // =========================================================

    public List<CouponResponse> getVendorCoupons(
            String email
    ) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        return couponRepository
                .findByVendor(vendor)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // VENDOR - APPROVE COUPON
    // =========================================================

    public CouponResponse approveCoupon(
            Long couponId,
            String email
    ) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        Coupon coupon =
                couponRepository.findById(couponId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );


        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------
        // Only the vendor who owns the coupon
        // can approve it.

        if (coupon.getVendor() == null ||
                !coupon.getVendor()
                        .getId()
                        .equals(vendor.getId())) {

            throw new RuntimeException(
                    "You are not authorized to approve this coupon"
            );
        }


        if (coupon.getStatus()
                != CouponStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending coupons can be approved"
            );
        }


        coupon.setStatus(
                CouponStatus.APPROVED
        );


        Coupon savedCoupon =
                couponRepository.save(
                        coupon
                );


        return convertToResponse(
                savedCoupon
        );
    }


    // =========================================================
    // VENDOR - REJECT COUPON
    // =========================================================

    public CouponResponse rejectCoupon(
            Long couponId,
            String email
    ) {

        User vendor =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        Coupon coupon =
                couponRepository.findById(couponId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );


        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (coupon.getVendor() == null ||
                !coupon.getVendor()
                        .getId()
                        .equals(vendor.getId())) {

            throw new RuntimeException(
                    "You are not authorized to reject this coupon"
            );
        }


        if (coupon.getStatus()
                != CouponStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending coupons can be rejected"
            );
        }


        coupon.setStatus(
                CouponStatus.REJECTED
        );


        Coupon savedCoupon =
                couponRepository.save(
                        coupon
                );


        return convertToResponse(
                savedCoupon
        );
    }

    public List<CouponResponse> getAvailableCoupons() {

        List<Coupon> coupons =
                couponRepository.findByStatus(
                        CouponStatus.APPROVED
                );

        return coupons.stream()
                .filter(Coupon::getActive)
                .map(this::convertToResponse)
                .toList();
    }

    public List<CouponResponse> getAvailableCoupons(String email) {

        List<Coupon> coupons =
                couponRepository.findByStatus(
                        CouponStatus.APPROVED
                );

        LocalDateTime now =
                LocalDateTime.now(ZoneId.of("Asia/Kolkata"));
        System.out.println("COUPON DEBUG NOW = " + now);

        List<CouponResponse> responses =
                new ArrayList<>();

        for (Coupon coupon : coupons) {

            // Active check
            if (!Boolean.TRUE.equals(coupon.getActive())) {
                continue;
            }

            // Start date check
            if (coupon.getStartDate() != null &&
                    now.isBefore(coupon.getStartDate())) {
                continue;
            }

            // Expiry check
            if (coupon.getExpiryDate() != null &&
                    now.isAfter(coupon.getExpiryDate())) {
                continue;
            }

            // Usage limit check
            if (coupon.getUsageLimit() != null &&
                    coupon.getUsedCount() != null &&
                    coupon.getUsedCount() >= coupon.getUsageLimit()) {
                continue;
            }

            // Coupon is available
            CouponResponse response =
                    convertToResponse(coupon);

            // Don't expose eligible product IDs
            // in the checkout coupon list
            response.setProductIds(null);

            responses.add(response);
        }

        return responses;
    }

    // =========================================================
// ADMIN - ACTIVATE / DEACTIVATE COUPON
// =========================================================

    public CouponResponse toggleCoupon(Long couponId) {

        Coupon coupon =
                couponRepository.findById(couponId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Coupon not found"
                                )
                        );

        // Toggle active status
        coupon.setActive(
                !Boolean.TRUE.equals(coupon.getActive())
        );

        Coupon savedCoupon =
                couponRepository.save(coupon);

        return convertToResponse(savedCoupon);
    }


}