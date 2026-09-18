package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.*;
import shopstack_backend.entity.Coupon;
import shopstack_backend.entity.CouponUsage;
import shopstack_backend.entity.DiscountType;
import shopstack_backend.entity.Order;
import shopstack_backend.entity.User;
import shopstack_backend.repository.CouponRepository;
import shopstack_backend.repository.CouponUsageRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Owns all coupon business logic: validation, discount calculation,
 * atomic usage tracking, and the read models the admin dashboard uses.
 */
@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CouponUsageRepository couponUsageRepository;
    @Transactional(readOnly = true)
    public CouponEvaluationResult validate(String rawCode, BigDecimal subtotal, String customerEmail) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new IllegalArgumentException("Please enter a coupon code.");
        }
        if (subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Your order is empty.");
        }
        Coupon coupon = couponRepository.findByCodeIgnoreCase(rawCode.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid coupon code. Please check and try again."));
        if (!coupon.isActive()) {
            throw new IllegalArgumentException("This coupon is not currently active.");
        }
        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException(
                    "This coupon isn't valid yet — it becomes active on " + coupon.getStartDate() + ".");
        }
        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) {
            throw new IllegalArgumentException(
                    "This coupon expired on " + coupon.getExpiryDate() + ".");
        }
        if (coupon.getMinOrderAmount() != null && subtotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new IllegalArgumentException(
                    "This coupon requires a minimum order amount of \u20B9" + coupon.getMinOrderAmount() + ".");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) {
            throw new IllegalArgumentException("This coupon has reached its usage limit.");
        }

        if (coupon.getPerCustomerLimit() != null && customerEmail != null) {
            long usedByThisCustomer = couponUsageRepository.countByCoupon_IdAndUser_Email(coupon.getId(), customerEmail);
            if (usedByThisCustomer >= coupon.getPerCustomerLimit()) {
                throw new IllegalArgumentException(
                        coupon.getPerCustomerLimit() == 1
                                ? "You've already used this coupon."
                                : "You've already used this coupon the maximum " + coupon.getPerCustomerLimit() + " time(s).");
            }
        }

        BigDecimal discountAmount = calculateDiscount(coupon, subtotal);
        return new CouponEvaluationResult(coupon, discountAmount);
    }

    private BigDecimal calculateDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = subtotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        // A coupon can never discount more than the order itself, and
        // never go negative regardless of how it was configured.
        if (discount.compareTo(subtotal) > 0) {
            discount = subtotal;
        }
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }
        return discount.setScale(2, RoundingMode.HALF_UP);
    }
    @Transactional(readOnly = true)
    public ApplyCouponResponseDTO preview(String rawCode, BigDecimal subtotal, String customerEmail) {
        CouponEvaluationResult eval = validate(rawCode, subtotal, customerEmail);
        Coupon coupon = eval.getCoupon();
        BigDecimal roundedSubtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        ApplyCouponResponseDTO dto = new ApplyCouponResponseDTO();
        dto.setCouponCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType().name());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setSubtotal(roundedSubtotal);
        dto.setDiscountAmount(eval.getDiscountAmount());
        dto.setFinalAmount(roundedSubtotal.subtract(eval.getDiscountAmount()));
        dto.setMessage("Coupon applied! You saved \u20B9" + eval.getDiscountAmount() + ".");
        return dto;
    }
    @Transactional
    public void reserveUsage(Coupon coupon) {
        int updated = couponRepository.incrementUsage(coupon.getId());
        if (updated == 0) {
            throw new IllegalArgumentException(
                    "This coupon just reached its usage limit. Please remove it and try again.");
        }
    }
    @Transactional
    public void recordUsage(Coupon coupon, User user, Order order, BigDecimal discountAmount) {
        CouponUsage usage = new CouponUsage();
        usage.setCoupon(coupon);
        usage.setUser(user);
        usage.setOrder(order);
        usage.setDiscountAmount(discountAmount);
        couponUsageRepository.save(usage);
    }
    @Transactional(readOnly = true)
    public List<AvailableCouponDTO> getAvailableCoupons(BigDecimal subtotal, String customerEmail) {
        BigDecimal safeSubtotal = subtotal != null ? subtotal : BigDecimal.ZERO;
        List<Coupon> validCoupons = couponRepository.findCurrentlyValidCoupons(LocalDate.now());

        List<AvailableCouponDTO> result = new ArrayList<>();
        for (Coupon coupon : validCoupons) {
            AvailableCouponDTO dto = new AvailableCouponDTO();
            dto.setCode(coupon.getCode());
            dto.setDiscountType(coupon.getDiscountType().name());
            dto.setDiscountValue(coupon.getDiscountValue());
            dto.setMinOrderAmount(coupon.getMinOrderAmount());
            dto.setMaxDiscount(coupon.getMaxDiscount());
            dto.setExpiryDate(coupon.getExpiryDate());

            boolean meetsMinOrder = coupon.getMinOrderAmount() == null
                    || safeSubtotal.compareTo(coupon.getMinOrderAmount()) >= 0;

            boolean withinPersonalLimit = true;
            if (coupon.getPerCustomerLimit() != null && customerEmail != null) {
                long usedByThisCustomer = couponUsageRepository.countByCoupon_IdAndUser_Email(coupon.getId(), customerEmail);
                withinPersonalLimit = usedByThisCustomer < coupon.getPerCustomerLimit();
            }

            boolean eligible = meetsMinOrder && withinPersonalLimit;
            dto.setEligible(eligible);

            if (eligible) {
                dto.setEstimatedDiscount(calculateDiscount(coupon, safeSubtotal));
            } else if (!withinPersonalLimit) {
                dto.setMessage("You've already used this coupon.");
            } else {
                BigDecimal shortfall = coupon.getMinOrderAmount().subtract(safeSubtotal)
                        .setScale(2, RoundingMode.HALF_UP);
                dto.setMessage("Add \u20B9" + shortfall + " more to unlock this coupon.");
            }
            result.add(dto);
        }

        // Eligible coupons first (best discount first within each group)
        result.sort(Comparator
                .comparing(AvailableCouponDTO::isEligible).reversed()
                .thenComparing(AvailableCouponDTO::getEstimatedDiscount,
                        Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }
    @Transactional
    public CouponResponseDTO createCoupon(CouponRequestDTO request) {
        validateRequest(request, null);
        Coupon coupon = new Coupon();
        applyRequestToEntity(coupon, request);
        coupon.setUsageCount(0);
        return toResponseDTO(couponRepository.save(coupon));
    }

    @Transactional
    public CouponResponseDTO updateCoupon(Long id, CouponRequestDTO request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found."));
        validateRequest(request, id);
        applyRequestToEntity(coupon, request);
        return toResponseDTO(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found."));

        // CouponUsage keeps the historical redemption record and references
        // this coupon with a non-null foreign key. A used coupon therefore
        // must not be hard-deleted, otherwise the database rejects the delete
        // and the admin loses the audit trail.
        long usageCount = couponUsageRepository.countByCoupon_Id(id);
        if (usageCount > 0) {
            throw new IllegalArgumentException(
                    "This coupon has " + usageCount
                            + " usage record(s) and cannot be deleted. Deactivate it instead to preserve order history.");
        }

        couponRepository.delete(coupon);
    }

    @Transactional
    public CouponResponseDTO setActive(Long id, boolean active) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found."));
        coupon.setActive(active);
        return toResponseDTO(couponRepository.save(coupon));
    }

    @Transactional(readOnly = true)
    public List<CouponResponseDTO> getAllCoupons() {
        return couponRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void validateRequest(CouponRequestDTO request, Long selfId) {
        if (request == null) {
            throw new IllegalArgumentException("Coupon details are required.");
        }
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new IllegalArgumentException("Coupon code is required.");
        }
        String normalizedCode = request.getCode().trim();
        couponRepository.findByCodeIgnoreCase(normalizedCode).ifPresent(existing -> {
            if (selfId == null || !existing.getId().equals(selfId)) {
                throw new IllegalArgumentException(
                        "A coupon with the code \"" + normalizedCode.toUpperCase() + "\" already exists.");
            }
        });

        DiscountType type;
        try {
            type = DiscountType.valueOf(
                    request.getDiscountType() == null ? "" : request.getDiscountType().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Discount type must be PERCENTAGE or FLAT.");
        }

        if (request.getDiscountValue() == null || request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than zero.");
        }
        if (type == DiscountType.PERCENTAGE && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("A percentage discount can't exceed 100%.");
        }
        if (request.getMinOrderAmount() != null && request.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Minimum order amount can't be negative.");
        }
        if (type == DiscountType.FLAT && request.getMaxDiscount() != null) {
            throw new IllegalArgumentException("Maximum discount can only be set for percentage coupons.");
        }
        if (request.getMaxDiscount() != null && request.getMaxDiscount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Maximum discount must be greater than zero.");
        }
        if (request.getStartDate() == null || request.getExpiryDate() == null) {
            throw new IllegalArgumentException("Both a start date and an expiry date are required.");
        }
        if (request.getExpiryDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("Expiry date can't be before the start date.");
        }
        if (request.getUsageLimit() != null && request.getUsageLimit() < 1) {
            throw new IllegalArgumentException("Usage limit must be at least 1 (leave it blank for unlimited).");
        }
        if (selfId != null && request.getUsageLimit() != null) {
            Coupon existing = couponRepository.findById(selfId).orElse(null);
            if (existing != null && request.getUsageLimit() < existing.getUsageCount()) {
                throw new IllegalArgumentException(
                        "Usage limit cannot be lower than the coupon's current usage count ("
                                + existing.getUsageCount() + ").");
            }
        }
        if (request.getPerCustomerLimit() != null && request.getPerCustomerLimit() < 1) {
            throw new IllegalArgumentException("Per-customer limit must be at least 1 (leave it blank for no cap).");
        }
    }

    private void applyRequestToEntity(Coupon coupon, CouponRequestDTO request) {
        coupon.setCode(request.getCode().trim().toUpperCase());
        coupon.setDiscountType(DiscountType.valueOf(request.getDiscountType().trim().toUpperCase()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscount(request.getMaxDiscount());
        coupon.setStartDate(request.getStartDate());
        coupon.setExpiryDate(request.getExpiryDate());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setPerCustomerLimit(request.getPerCustomerLimit());
        coupon.setActive(request.getActive() == null || request.getActive());
    }

    private CouponResponseDTO toResponseDTO(Coupon coupon) {
        CouponResponseDTO dto = new CouponResponseDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDiscountType(coupon.getDiscountType().name());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setMinOrderAmount(coupon.getMinOrderAmount());
        dto.setMaxDiscount(coupon.getMaxDiscount());
        dto.setStartDate(coupon.getStartDate());
        dto.setExpiryDate(coupon.getExpiryDate());
        dto.setUsageLimit(coupon.getUsageLimit());
        dto.setPerCustomerLimit(coupon.getPerCustomerLimit());
        dto.setUsageCount(coupon.getUsageCount());
        dto.setActive(coupon.isActive());
        dto.setComputedStatus(computeStatus(coupon));
        dto.setCreatedAt(coupon.getCreatedAt());
        return dto;
    }

    private String computeStatus(Coupon coupon) {
        if (!coupon.isActive()) return "INACTIVE";
        LocalDate today = LocalDate.now();
        if (coupon.getStartDate() != null && today.isBefore(coupon.getStartDate())) return "SCHEDULED";
        if (coupon.getExpiryDate() != null && today.isAfter(coupon.getExpiryDate())) return "EXPIRED";
        if (coupon.getUsageLimit() != null && coupon.getUsageCount() >= coupon.getUsageLimit()) return "LIMIT_REACHED";
        return "ACTIVE";
    }

    // ---------------------------------------------------------------
    // Admin: analytics + usage tracking
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CouponAnalyticsDTO> getAnalytics() {
        List<Coupon> coupons = couponRepository.findAll();
        return coupons.stream().map(coupon -> {
            BigDecimal totalDiscount = couponUsageRepository.sumDiscountByCouponId(coupon.getId());
            if (totalDiscount == null) {
                totalDiscount = BigDecimal.ZERO;
            }
            CouponAnalyticsDTO dto = new CouponAnalyticsDTO();
            dto.setCouponId(coupon.getId());
            dto.setCode(coupon.getCode());
            dto.setDiscountType(coupon.getDiscountType().name());
            dto.setDiscountValue(coupon.getDiscountValue());
            dto.setActive(coupon.isActive());
            dto.setUsageLimit(coupon.getUsageLimit());
            dto.setUsageCount(coupon.getUsageCount());
            dto.setTotalDiscountGiven(totalDiscount.setScale(2, RoundingMode.HALF_UP));
            return dto;
        })
        .sorted(Comparator.comparingInt(CouponAnalyticsDTO::getUsageCount).reversed())
        .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CouponUsageResponseDTO> getAllUsages() {
        return couponUsageRepository.findAllByOrderByUsedAtDesc().stream()
                .map(this::toUsageDTO)
                .collect(Collectors.toList());
    }

    private CouponUsageResponseDTO toUsageDTO(CouponUsage usage) {
        CouponUsageResponseDTO dto = new CouponUsageResponseDTO();
        dto.setId(usage.getId());
        dto.setCouponCode(usage.getCoupon().getCode());
        dto.setCustomerId(usage.getUser().getId());
        dto.setCustomerName(usage.getUser().getFullName());
        dto.setCustomerEmail(usage.getUser().getEmail());
        dto.setOrderId(usage.getOrder().getId());
        dto.setDiscountAmount(usage.getDiscountAmount());
        dto.setUsedAt(usage.getUsedAt());
        return dto;
    }

    /**
     * Small read-only holder for a validated coupon + the discount it
     * produces against a particular subtotal. Not persisted itself.
     */
    public static class CouponEvaluationResult {
        private final Coupon coupon;
        private final BigDecimal discountAmount;

        public CouponEvaluationResult(Coupon coupon, BigDecimal discountAmount) {
            this.coupon = coupon;
            this.discountAmount = discountAmount;
        }

        public Coupon getCoupon() {
            return coupon;
        }

        public BigDecimal getDiscountAmount() {
            return discountAmount;
        }
    }
}