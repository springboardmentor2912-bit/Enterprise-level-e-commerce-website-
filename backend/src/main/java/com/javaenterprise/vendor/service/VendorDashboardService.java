package com.javaenterprise.vendor.service;

import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderItemRepository;
import com.javaenterprise.product.entity.Product;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.vendor.dto.VendorDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VendorDashboardService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    private User getVendor(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public VendorDashboardResponse getDashboard(Authentication authentication) {

        User vendor = getVendor(authentication);

        long totalProducts = productRepository.countByVendor(vendor);

        long activeProducts = productRepository.countByVendorAndActiveTrue(vendor);

        long outOfStockProducts =
                productRepository.countByVendorAndStock(vendor, 0);

        List<OrderItem> orderItems =
                orderItemRepository.findByProductVendor(vendor);

        Set<Long> pendingOrders = new HashSet<>();
        Set<Long> completedOrders = new HashSet<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (OrderItem item : orderItems) {

            if (item.getOrder().getStatus() == OrderStatus.PENDING) {
                pendingOrders.add(item.getOrder().getId());
            }

            if (item.getOrder().getStatus() == OrderStatus.DELIVERED) {

                completedOrders.add(item.getOrder().getId());

                totalRevenue = totalRevenue.add(item.getSubtotal());
            }
        }

        return VendorDashboardResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .outOfStockProducts(outOfStockProducts)
                .pendingOrders((long) pendingOrders.size())
                .completedOrders((long) completedOrders.size())
                .totalRevenue(totalRevenue)
                .build();
    }
}