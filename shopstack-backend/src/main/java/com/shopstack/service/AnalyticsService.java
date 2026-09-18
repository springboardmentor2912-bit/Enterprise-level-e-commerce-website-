package com.shopstack.service;

import com.shopstack.dto.report.MarketplaceAnalytics;
import com.shopstack.enums.OrderStatus;
import com.shopstack.enums.ProductApprovalStatus;
import com.shopstack.enums.Role;
import com.shopstack.enums.VendorApprovalStatus;
import com.shopstack.enums.WarehouseTaskStatus;
import com.shopstack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final WarehouseTaskRepository warehouseTaskRepository;

    public MarketplaceAnalytics getMarketplaceAnalytics() {
        long totalUsers = userRepository.count();
        long customers = userRepository.findAll().stream().filter(u -> u.getRole() == Role.CUSTOMER).count();
        long vendors = vendorRepository.count();
        long approvedVendors = vendorRepository.findByApprovalStatus(VendorApprovalStatus.APPROVED,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long pendingVendors = vendorRepository.findByApprovalStatus(VendorApprovalStatus.PENDING,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        long totalProducts = productRepository.count();
        long approvedProducts = productRepository.findByApprovalStatusAndActiveTrue(ProductApprovalStatus.APPROVED,
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        List<com.shopstack.entity.Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        long confirmedOrders = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.PENDING)
                .count();
        long cancelledOrders = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

        BigDecimal grossRevenue = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.PENDING)
                .map(com.shopstack.entity.Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommission = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED && o.getStatus() != OrderStatus.PENDING)
                .flatMap(o -> o.getItems().stream())
                .map(item -> {
                    BigDecimal lineTotal = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
                    BigDecimal rate = item.getVendor().getCommissionRate();
                    return lineTotal.multiply(rate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingReturns = returnRequestRepository.findByStatus(
                com.shopstack.enums.ReturnStatus.REQUESTED, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long openTasks = warehouseTaskRepository.findByStatusNotOrderByCreatedAtAsc(
                WarehouseTaskStatus.READY_FOR_SHIPMENT, org.springframework.data.domain.Pageable.unpaged()).getTotalElements();

        return MarketplaceAnalytics.builder()
                .totalUsers(totalUsers)
                .totalCustomers(customers)
                .totalVendors(vendors)
                .approvedVendors(approvedVendors)
                .pendingVendors(pendingVendors)
                .totalProducts(totalProducts)
                .approvedProducts(approvedProducts)
                .totalOrders(totalOrders)
                .confirmedOrders(confirmedOrders)
                .cancelledOrders(cancelledOrders)
                .totalGrossRevenue(grossRevenue)
                .totalCommissionEarned(totalCommission)
                .pendingReturns(pendingReturns)
                .openWarehouseTasks(openTasks)
                .build();
    }
}
