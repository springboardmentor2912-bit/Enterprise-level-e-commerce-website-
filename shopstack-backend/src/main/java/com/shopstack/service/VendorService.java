package com.shopstack.service;

import com.shopstack.dto.vendor.VendorAnalyticsResponse;
import com.shopstack.dto.vendor.VendorResponse;
import com.shopstack.entity.Vendor;
import com.shopstack.enums.OrderStatus;
import com.shopstack.enums.ProductApprovalStatus;
import com.shopstack.enums.VendorApprovalStatus;
import com.shopstack.exception.ResourceNotFoundException;
import com.shopstack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final OrderItemRepository orderItemRepository;

    public Vendor getByUserId(Long userId) {
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor profile not found for this user"));
    }

    public Vendor getById(Long vendorId) {
        return vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
    }

    public Page<Vendor> getPendingVendors(Pageable pageable) {
        return vendorRepository.findByApprovalStatus(VendorApprovalStatus.PENDING, pageable);
    }

    @Transactional
    public Vendor approveVendor(Long vendorId) {
        Vendor vendor = getById(vendorId);
        vendor.setApprovalStatus(VendorApprovalStatus.APPROVED);
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor rejectVendor(Long vendorId) {
        Vendor vendor = getById(vendorId);
        vendor.setApprovalStatus(VendorApprovalStatus.REJECTED);
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateCommissionRate(Long vendorId, BigDecimal newRate) {
        Vendor vendor = getById(vendorId);
        vendor.setCommissionRate(newRate);
        return vendorRepository.save(vendor);
    }

    public VendorAnalyticsResponse getAnalytics(Long vendorId) {
        long totalProducts = productRepository.findByVendorId(vendorId, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long approved = productRepository.findByVendorId(vendorId, org.springframework.data.domain.Pageable.unpaged())
                .stream().filter(p -> p.getApprovalStatus() == ProductApprovalStatus.APPROVED).count();
        long pending = totalProducts - approved;

        List<com.shopstack.entity.OrderItem> items = orderItemRepository.findByVendorId(vendorId);
        long totalOrders = items.stream().map(i -> i.getOrder().getId()).distinct().count();
        BigDecimal revenue = items.stream()
                .filter(i -> i.getOrder().getStatus() != OrderStatus.CANCELLED)
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long lowStock = inventoryRepository.findByVendorId(vendorId).stream().filter(com.shopstack.entity.Inventory::isLowStock).count();

        return VendorAnalyticsResponse.builder()
                .totalProducts(totalProducts)
                .approvedProducts(approved)
                .pendingProducts(pending)
                .totalOrders(totalOrders)
                .totalRevenue(revenue)
                .lowStockProductCount(lowStock)
                .build();
    }

    public com.shopstack.dto.report.VendorCommissionSummary getCommissionSummary(Long vendorId) {
        Vendor vendor = getById(vendorId);
        List<com.shopstack.entity.OrderItem> items = orderItemRepository.findByVendorId(vendorId);

        BigDecimal grossRevenue = items.stream()
                .filter(i -> i.getOrder().getStatus() != OrderStatus.CANCELLED)
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal commissionAmount = grossRevenue.multiply(vendor.getCommissionRate())
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

        return com.shopstack.dto.report.VendorCommissionSummary.builder()
                .grossRevenue(grossRevenue)
                .commissionRate(vendor.getCommissionRate())
                .commissionAmount(commissionAmount)
                .netEarnings(grossRevenue.subtract(commissionAmount))
                .build();
    }

    public VendorResponse toResponse(Vendor vendor) {
        return VendorResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .businessDescription(vendor.getBusinessDescription())
                .approvalStatus(vendor.getApprovalStatus().name())
                .commissionRate(vendor.getCommissionRate())
                .ownerEmail(vendor.getUser().getEmail())
                .build();
    }
}
