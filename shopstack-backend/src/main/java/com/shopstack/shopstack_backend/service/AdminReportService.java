package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Role;
import com.shopstack.shopstack_backend.repository.OrderItemRepository;
import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminReportService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminReportService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public Map<String, Object> getReportSummary() {

        Map<String, Object> report = new HashMap<>();

        List<Order> orders =
                orderRepository.findAllByOrderByOrderDateDesc();

        /*
         * ACTUAL MARKETPLACE SALES
         *
         * Only products actually purchased by customers
         * are included here.
         *
         * price × quantity
         */
        double totalSales =
                orderItemRepository.getTotalSales();


        /*
         * ORDER STATUS
         */

        long pending =
                orders.stream()
                        .filter(o ->
                                "PENDING".equalsIgnoreCase(o.getStatus()))
                        .count();

        long confirmed =
                orders.stream()
                        .filter(o ->
                                "CONFIRMED".equalsIgnoreCase(o.getStatus()))
                        .count();

        long delivered =
                orders.stream()
                        .filter(o ->
                                "DELIVERED".equalsIgnoreCase(o.getStatus()))
                        .count();

        long cancelled =
                orders.stream()
                        .filter(o ->
                                "CANCELLED".equalsIgnoreCase(o.getStatus()))
                        .count();


        /*
         * COMMISSION
         */

        double commissionRate = 10.0;

        double commission =
                totalSales * commissionRate / 100;

        double vendorEarnings =
                totalSales - commission;


        /*
         * MARKETPLACE INFORMATION
         */

        report.put(
                "totalOrders",
                orders.size()
        );

        report.put(
                "totalSales",
                totalSales
        );

        report.put(
                "totalCustomers",
                userRepository.countByRole(Role.CUSTOMER)
        );

        report.put(
                "totalVendors",
                userRepository.countByRole(Role.VENDOR)
        );

        report.put(
                "totalProducts",
                productRepository.count()
        );


        /*
         * ORDER STATUS
         */

        report.put(
                "pendingOrders",
                pending
        );

        report.put(
                "confirmedOrders",
                confirmed
        );

        report.put(
                "deliveredOrders",
                delivered
        );

        report.put(
                "cancelledOrders",
                cancelled
        );


        /*
         * FINANCIAL REPORT
         */

        report.put(
                "commissionRate",
                commissionRate
        );

        report.put(
                "platformCommission",
                commission
        );

        report.put(
                "vendorEarnings",
                vendorEarnings
        );

        return report;
    }
}