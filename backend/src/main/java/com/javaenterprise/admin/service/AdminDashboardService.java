package com.javaenterprise.admin.service;

import com.javaenterprise.admin.dto.AdminDashboardResponse;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.product.entity.ProductStatus;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.product.repository.ProductRepository;
import com.javaenterprise.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminDashboardResponse dashboard() {

        BigDecimal revenue = orderRepository.totalRevenue();

        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        return AdminDashboardResponse.builder()

                .totalUsers(userRepository.count())

                .totalCustomers(userRepository.countByRole("CUSTOMER"))

                .totalVendors(userRepository.countByRole("VENDOR"))

                .totalWarehouseStaff(userRepository.countByRole("WAREHOUSE_STAFF"))

                .totalProducts(productRepository.count())

                .pendingProducts(productRepository.countByStatus(ProductStatus.PENDING))

                .approvedProducts(productRepository.countByStatus(ProductStatus.APPROVED))

                .rejectedProducts(productRepository.countByStatus(ProductStatus.REJECTED))

                .totalOrders(orderRepository.count())

                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))

                .completedOrders(orderRepository.countByStatus(OrderStatus.DELIVERED))

                .totalRevenue(revenue)

                .build();
    }
}