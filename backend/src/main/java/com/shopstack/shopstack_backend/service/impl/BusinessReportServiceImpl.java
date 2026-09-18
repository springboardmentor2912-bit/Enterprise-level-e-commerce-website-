package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.OrderStatus;
import com.shopstack.shopstack_backend.constant.RoleName;
import com.shopstack.shopstack_backend.dto.response.BusinessReportResponse;
import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.repository.VendorRepository;
import com.shopstack.shopstack_backend.service.BusinessReportService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BusinessReportServiceImpl
        implements BusinessReportService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public BusinessReportServiceImpl(
            UserRepository userRepository,
            VendorRepository vendorRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {

        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessReportResponse getBusinessReport() {

        // =========================
        // USERS
        // =========================

        long totalUsers =
                userRepository.count();

        long totalCustomers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() != null &&
                                        user.getRole().getRoleName() ==
                                                RoleName.ROLE_CUSTOMER)
                        .count();


        // =========================
        // VENDORS
        // =========================

        long totalVendors =
                vendorRepository.count();

        long approvedVendors =
                vendorRepository.findAll()
                        .stream()
                        .filter(Vendor ->
                                Vendor.isApproved())
                        .count();


        // =========================
        // PRODUCTS
        // =========================

        long totalProducts =
                productRepository.count();


        // =========================
        // ORDERS
        // =========================

        List<Order> orders =
                orderRepository.findAll();

        long totalOrders =
                orders.size();


        // =========================
        // SALES
        // =========================

        double totalSales =
                orders.stream()
                        .filter(order ->
                                order.getStatus() !=
                                        OrderStatus.CANCELLED)
                        .filter(order ->
                                order.getStatus() !=
                                        OrderStatus.RETURNED)
                        .filter(order ->
                                order.getStatus() !=
                                        OrderStatus.REFUNDED)
                        .mapToDouble(order ->
                                order.getTotalAmount() == null
                                        ? 0.0
                                        : order.getTotalAmount())
                        .sum();


        // =========================
        // COMMISSION
        // =========================

        double totalCommission =
                totalSales * 0.10;


        // =========================
        // VENDOR EARNINGS
        // =========================

        double vendorEarnings =
                totalSales - totalCommission;


        // =========================
        // ORDER STATUS
        // =========================

        long placedOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.PLACED
                );

        long confirmedOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.CONFIRMED
                );

        long shippedOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.SHIPPED
                );

        long deliveredOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.DELIVERED
                );

        long cancelledOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.CANCELLED
                );

        long returnedOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.RETURNED
                );

        long refundedOrders =
                countOrdersByStatus(
                        orders,
                        OrderStatus.REFUNDED
                );


        // =========================
        // REPORT
        // =========================

        return new BusinessReportResponse(
                totalUsers,
                totalCustomers,
                totalVendors,
                approvedVendors,
                totalProducts,
                totalOrders,
                totalSales,
                totalCommission,
                vendorEarnings,
                placedOrders,
                confirmedOrders,
                shippedOrders,
                deliveredOrders,
                cancelledOrders,
                returnedOrders,
                refundedOrders
        );
    }


    // =========================
    // COUNT BY STATUS
    // =========================

    private long countOrdersByStatus(
            List<Order> orders,
            OrderStatus status) {

        return orders.stream()
                .filter(order ->
                        order.getStatus() == status)
                .count();
    }
}