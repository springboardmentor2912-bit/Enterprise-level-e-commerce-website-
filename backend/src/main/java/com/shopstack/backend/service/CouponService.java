package com.shopstack.backend.service;

import com.shopstack.backend.model.Coupon;
import com.shopstack.backend.model.CouponUsage;
import com.shopstack.backend.model.VendorCouponApproval;
import com.shopstack.backend.model.Product;
import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.repository.CouponUsageRepository;
import com.shopstack.backend.repository.VendorCouponApprovalRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.model.ProductCoupon;
import com.shopstack.backend.repository.ProductCouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;

    @Autowired
    private VendorCouponApprovalRepository vendorCouponApprovalRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductCouponRepository productCouponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAllByOrderByIdDesc();
    }

    public Optional<Coupon> getCouponByCode(String code) {
        return couponRepository.findByCodeIgnoreCase(code);
    }

    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        if (coupon.getCode() != null) {
            coupon.setCode(coupon.getCode().trim().toUpperCase());
        }
        Optional<Coupon> existing = couponRepository.findByCodeIgnoreCase(coupon.getCode());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Coupon code already exists");
        }
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon updateCoupon(Long id, Coupon updated) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));

        String oldCode = existing.getCode();

        if (updated.getCode() != null) {
            String newCode = updated.getCode().trim().toUpperCase();
            if (!newCode.equals(existing.getCode())) {
                Optional<Coupon> opt = couponRepository.findByCodeIgnoreCase(newCode);
                if (opt.isPresent()) {
                    throw new IllegalArgumentException("Coupon code already exists");
                }
                existing.setCode(newCode);
            }
        }

        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinOrderAmount(updated.getMinOrderAmount());
        existing.setMaxDiscount(updated.getMaxDiscount());
        existing.setStartDate(updated.getStartDate());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setUsageLimit(updated.getUsageLimit());
        existing.setActive(updated.isActive());

        // Reset approvals and mappings because admin changed/edited the coupon details
        List<VendorCouponApproval> approvals = vendorCouponApprovalRepository.findByCouponCodeIgnoreCase(oldCode);
        vendorCouponApprovalRepository.deleteAll(approvals);

        List<ProductCoupon> mappings = productCouponRepository.findByCouponCodeIgnoreCase(oldCode);
        productCouponRepository.deleteAll(mappings);

        if (!oldCode.equalsIgnoreCase(existing.getCode())) {
            List<VendorCouponApproval> newApprovals = vendorCouponApprovalRepository.findByCouponCodeIgnoreCase(existing.getCode());
            vendorCouponApprovalRepository.deleteAll(newApprovals);

            List<ProductCoupon> newMappings = productCouponRepository.findByCouponCodeIgnoreCase(existing.getCode());
            productCouponRepository.deleteAll(newMappings);
        }

        return couponRepository.save(existing);
    }

    @Transactional
    public Coupon toggleActiveStatus(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        coupon.setActive(!coupon.isActive());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Optional<Coupon> couponOpt = couponRepository.findById(id);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            // Delete all vendor approvals associated with this coupon code
            List<VendorCouponApproval> approvals = vendorCouponApprovalRepository.findByCouponCodeIgnoreCase(coupon.getCode());
            vendorCouponApprovalRepository.deleteAll(approvals);

            // Delete all mappings associated with this coupon code
            List<ProductCoupon> mappings = productCouponRepository.findByCouponCodeIgnoreCase(coupon.getCode());
            productCouponRepository.deleteAll(mappings);
            
            // Delete the coupon
            couponRepository.delete(coupon);
        }
    }

    public List<Map<String, Object>> getVendorCoupons(Long vendorId) {
        List<Coupon> coupons = couponRepository.findAllByOrderByIdDesc();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Coupon coupon : coupons) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", coupon.getId());
            map.put("code", coupon.getCode());
            map.put("discountType", coupon.getDiscountType());
            map.put("discountValue", coupon.getDiscountValue());
            map.put("minOrderAmount", coupon.getMinOrderAmount());
            map.put("maxDiscount", coupon.getMaxDiscount());
            map.put("startDate", coupon.getStartDate() != null ? coupon.getStartDate().toString() : null);
            map.put("expiryDate", coupon.getExpiryDate() != null ? coupon.getExpiryDate().toString() : null);
            map.put("usageLimit", coupon.getUsageLimit());
            map.put("usageCount", coupon.getUsageCount());
            map.put("active", coupon.isActive());

            Optional<VendorCouponApproval> approvalOpt = vendorCouponApprovalRepository.findByVendorIdAndCouponCodeIgnoreCase(vendorId, coupon.getCode());
            if (approvalOpt.isPresent()) {
                map.put("approvalStatus", approvalOpt.get().getStatus());
            } else {
                map.put("approvalStatus", "PENDING");
            }
            result.add(map);
        }
        return result;
    }

    @Transactional
    public VendorCouponApproval setVendorCouponStatus(Long vendorId, String couponCode, String status) {
        String code = couponCode.trim().toUpperCase();
        Optional<VendorCouponApproval> approvalOpt = vendorCouponApprovalRepository.findByVendorIdAndCouponCodeIgnoreCase(vendorId, code);
        VendorCouponApproval approval;
        if (approvalOpt.isPresent()) {
            approval = approvalOpt.get();
            approval.setStatus(status.toUpperCase());
        } else {
            approval = new VendorCouponApproval(vendorId, code, status.toUpperCase());
        }
        vendorCouponApprovalRepository.save(approval);

        if ("REJECTED".equalsIgnoreCase(status)) {
            List<Product> products = productRepository.findByVendorId(vendorId);
            for (Product p : products) {
                productCouponRepository.findByProductIdAndCouponCodeIgnoreCase(p.getId(), code)
                    .ifPresent(pc -> productCouponRepository.delete(pc));
            }
        }
        return approval;
    }

    @Transactional
    public VendorCouponApproval setVendorCouponStatusWithProducts(Long vendorId, String couponCode, String status, boolean applyToAll, List<Long> productIds) {
        String code = couponCode.trim().toUpperCase();
        Optional<VendorCouponApproval> approvalOpt = vendorCouponApprovalRepository.findByVendorIdAndCouponCodeIgnoreCase(vendorId, code);
        VendorCouponApproval approval;
        if (approvalOpt.isPresent()) {
            approval = approvalOpt.get();
            approval.setStatus(status.toUpperCase());
        } else {
            approval = new VendorCouponApproval(vendorId, code, status.toUpperCase());
        }
        vendorCouponApprovalRepository.save(approval);

        if ("APPROVED".equalsIgnoreCase(status)) {
            List<Product> products = productRepository.findByVendorId(vendorId);
            // Delete existing mappings for this vendor's products and this coupon code
            for (Product p : products) {
                productCouponRepository.findByProductIdAndCouponCodeIgnoreCase(p.getId(), code)
                    .ifPresent(pc -> productCouponRepository.delete(pc));
            }

            // Insert new mappings
            if (applyToAll) {
                for (Product p : products) {
                    productCouponRepository.save(new ProductCoupon(p.getId(), code));
                }
            } else {
                for (Long pId : productIds) {
                    productCouponRepository.save(new ProductCoupon(pId, code));
                }
            }
        }
        
        return approval;
    }

    public Map<String, Object> validateAndCalculateDiscount(String code, List<Map<String, Object>> items, Long userId) {
        Map<String, Object> response = new HashMap<>();

        if (code == null || code.trim().isEmpty()) {
            response.put("valid", false);
            response.put("message", "Coupon code is empty");
            return response;
        }

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (couponOpt.isEmpty()) {
            response.put("valid", false);
            response.put("message", "Coupon code does not exist.");
            return response;
        }

        Coupon coupon = couponOpt.get();

        if (!coupon.isActive()) {
            response.put("valid", false);
            response.put("message", "Coupon is inactive.");
            return response;
        }

        LocalDateTime now = LocalDateTime.now();
        // Allow 24-hour buffer for timezone disparities (e.g. client IST UTC+05:30 vs server UTC)
        if (coupon.getStartDate() != null && now.plusHours(24).isBefore(coupon.getStartDate())) {
            response.put("valid", false);
            response.put("message", "Coupon promotion campaign has not started yet.");
            return response;
        }

        if (coupon.getExpiryDate() != null && now.minusHours(24).isAfter(coupon.getExpiryDate())) {
            response.put("valid", false);
            response.put("message", "Coupon has expired.");
            return response;
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            response.put("valid", false);
            response.put("message", "Coupon usage limit has been reached.");
            return response;
        }

        double totalCartSubtotal = 0.0;
        double eligibleSubtotal = 0.0;
        List<String> excludedItemNames = new ArrayList<>();

        if (items != null) {
            for (Map<String, Object> itemData : items) {
                Long productId = Long.parseLong(itemData.get("id").toString());
                int quantity = Integer.parseInt(itemData.get("quantity").toString());
                double price = Double.parseDouble(itemData.get("price").toString());
                totalCartSubtotal += price * quantity;

                Optional<Product> prodOpt = productRepository.findById(productId);
                if (prodOpt.isPresent()) {
                    Product product = prodOpt.get();
                    boolean eligible = true;

                    // 1. Check product couponsEnabled
                    if (!product.isCouponsEnabled()) {
                        eligible = false;
                    }

                    // 2. Check vendor approval status and product-coupon mapping
                    if (eligible && product.getVendorId() != null) {
                        Optional<VendorCouponApproval> approvalOpt = vendorCouponApprovalRepository.findByVendorIdAndCouponCodeIgnoreCase(
                                product.getVendorId(), coupon.getCode());
                        if (approvalOpt.isEmpty() || !"APPROVED".equalsIgnoreCase(approvalOpt.get().getStatus())) {
                            eligible = false;
                        } else {
                            // Check if this specific product is mapped to the coupon code
                            Optional<ProductCoupon> mapping = productCouponRepository.findByProductIdAndCouponCodeIgnoreCase(product.getId(), coupon.getCode());
                            if (mapping.isEmpty()) {
                                eligible = false;
                            }
                        }
                    }

                    if (eligible) {
                        eligibleSubtotal += price * quantity;
                    } else {
                        excludedItemNames.add(product.getName());
                    }
                }
            }
        }

        if (coupon.getMinOrderAmount() != null && totalCartSubtotal < coupon.getMinOrderAmount()) {
            response.put("valid", false);
            response.put("message", "Minimum order amount of ₹" + String.format("%.2f", coupon.getMinOrderAmount()) + " required to apply this coupon.");
            return response;
        }

        if (eligibleSubtotal <= 0) {
            response.put("valid", false);
            response.put("message", "None of the items in your cart are eligible for this coupon. They require vendor confirmation or have coupons disabled.");
            return response;
        }

        // Calculate discount
        double discountAmount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = (coupon.getDiscountValue() / 100.0) * eligibleSubtotal;
            if (coupon.getMaxDiscount() != null && discountAmount > coupon.getMaxDiscount()) {
                discountAmount = coupon.getMaxDiscount();
            }
        } else if ("FIXED".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = coupon.getDiscountValue();
        }

        if (discountAmount > eligibleSubtotal) {
            discountAmount = eligibleSubtotal;
        }

        discountAmount = Math.round(discountAmount * 100.0) / 100.0;
        double finalAmount = Math.round((totalCartSubtotal - discountAmount) * 100.0) / 100.0;

        response.put("valid", true);
        response.put("message", "Coupon applied successfully!");
        response.put("discountAmount", discountAmount);
        response.put("finalAmount", finalAmount);
        response.put("couponCode", coupon.getCode());
        response.put("discountType", coupon.getDiscountType());
        response.put("discountValue", coupon.getDiscountValue());
        response.put("excludedItems", excludedItemNames);

        return response;
    }

    @Transactional
    public void recordUsage(String code, Long userId, String orderId, double discountAmount) {
        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCase(code.trim());
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setUsageCount(coupon.getUsageCount() + 1);
            couponRepository.save(coupon);

            CouponUsage usage = new CouponUsage();
            usage.setCouponCode(coupon.getCode());
            usage.setUserId(userId);
            usage.setOrderId(orderId);
            usage.setDiscountAmount(discountAmount);
            usage.setUsageDateTime(LocalDateTime.now());

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                usage.setUserEmail(userOpt.get().getEmail());
            }

            couponUsageRepository.save(usage);
        }
    }

    public List<Map<String, Object>> getCouponAnalytics() {
        List<Coupon> coupons = couponRepository.findAll();
        List<Map<String, Object>> analytics = new ArrayList<>();

        for (Coupon coupon : coupons) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", coupon.getId());
            map.put("code", coupon.getCode());
            map.put("discountType", coupon.getDiscountType());
            map.put("discountValue", coupon.getDiscountValue());
            map.put("usageLimit", coupon.getUsageLimit());
            map.put("usageCount", coupon.getUsageCount());
            map.put("active", coupon.isActive());

            List<CouponUsage> usages = couponUsageRepository.findByCouponCodeIgnoreCase(coupon.getCode());
            double totalDiscount = usages.stream().mapToDouble(CouponUsage::getDiscountAmount).sum();
            map.put("totalDiscount", Math.round(totalDiscount * 100.0) / 100.0);
            map.put("totalUses", usages.size());

            List<Map<String, Object>> history = new ArrayList<>();
            for (CouponUsage usage : usages) {
                Map<String, Object> hMap = new HashMap<>();
                hMap.put("userId", usage.getUserId());
                hMap.put("userEmail", usage.getUserEmail());
                hMap.put("orderId", usage.getOrderId());
                hMap.put("discountAmount", usage.getDiscountAmount());
                hMap.put("usageDate", usage.getUsageDateTime().toString());
                history.add(hMap);
            }
            map.put("history", history);

            analytics.add(map);
        }

        return analytics;
    }

    public List<VendorCouponApproval> getAllApprovals() {
        return vendorCouponApprovalRepository.findAll();
    }

    public List<Long> getProductIdsForCoupon(String couponCode) {
        List<ProductCoupon> mappings = productCouponRepository.findByCouponCodeIgnoreCase(couponCode.trim());
        List<Long> ids = new java.util.ArrayList<>();
        for (ProductCoupon pc : mappings) {
            ids.add(pc.getProductId());
        }
        return ids;
    }

    public List<ProductCoupon> getAllMappings() {
        return productCouponRepository.findAll();
    }
}
