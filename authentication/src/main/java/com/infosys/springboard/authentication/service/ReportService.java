package com.infosys.springboard.authentication.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.infosys.springboard.authentication.entity.Order;
import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.ProductRepository;
import com.infosys.springboard.authentication.repository.RefundRepository;
import com.infosys.springboard.authentication.repository.UserRepository;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final RefundRepository refundRepository;

    public ReportService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepository userRepository,
            RefundRepository refundRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.refundRepository = refundRepository;
    }

    // =========================================================
    // OVERALL DASHBOARD REPORT
    // =========================================================

    public Map<String, Object> getDashboardReport() {

        Map<String, Object> report = new HashMap<>();

        report.put(
                "totalOrders",
                orderRepository.count()
        );

        report.put(
                "totalProducts",
                productRepository.count()
        );

        report.put(
                "totalCustomers",
                userRepository.countByRole("CUSTOMER")
        );

        report.put(
                "totalVendors",
                userRepository.countByRole("VENDOR")
        );

        report.put(
                "totalAdmins",
                userRepository.countByRole("ADMINISTRATOR")
        );

        report.put(
                "totalWarehouseStaff",
                userRepository.countByRole("WAREHOUSE_STAFF")
        );

        report.put(
                "totalRefunds",
                refundRepository.count()
        );

        return report;
    }

    // =========================================================
    // ORDER REPORT
    // =========================================================

    public Map<String, Object> getOrderReport() {

        List<Order> orders = orderRepository.findAll();

        Map<String, Object> report = new HashMap<>();

        long pending = 0;
        long confirmed = 0;
        long shipped = 0;
        long delivered = 0;
        long cancelled = 0;

        for (Order order : orders) {

            String status = order.getStatus();

            if (status == null) {
                continue;
            }

            switch (status.toUpperCase()) {

                case "PENDING":
                    pending++;
                    break;

                case "CONFIRMED":
                    confirmed++;
                    break;

                case "SHIPPED":
                    shipped++;
                    break;

                case "DELIVERED":
                    delivered++;
                    break;

                case "CANCELLED":
                    cancelled++;
                    break;

                default:
                    break;
            }
        }

        report.put("totalOrders", orders.size());
        report.put("pendingOrders", pending);
        report.put("confirmedOrders", confirmed);
        report.put("shippedOrders", shipped);
        report.put("deliveredOrders", delivered);
        report.put("cancelledOrders", cancelled);

        return report;
    }

    // =========================================================
    // USER REPORT
    // =========================================================

    public Map<String, Object> getUserReport() {

        Map<String, Object> report = new HashMap<>();

        report.put(
                "customers",
                userRepository.countByRole("CUSTOMER")
        );

        report.put(
                "vendors",
                userRepository.countByRole("VENDOR")
        );

        report.put(
                "administrators",
                userRepository.countByRole("ADMINISTRATOR")
        );

        report.put(
                "warehouseStaff",
                userRepository.countByRole("WAREHOUSE_STAFF")
        );

        report.put(
                "totalUsers",
                userRepository.count()
        );

        return report;
    }

    // =========================================================
    // PRODUCT REPORT
    // =========================================================

    public Map<String, Object> getProductReport() {

        Map<String, Object> report = new HashMap<>();

        report.put(
                "totalProducts",
                productRepository.count()
        );

        report.put(
                "totalVendors",
                userRepository.countByRole("VENDOR")
        );

        return report;
    }

    // =========================================================
    // REFUND REPORT
    // =========================================================

    public Map<String, Object> getRefundReport() {

        Map<String, Object> report = new HashMap<>();

        report.put(
                "totalRefunds",
                refundRepository.count()
        );

        report.put(
                "requestedRefunds",
                refundRepository
                        .findByStatus("REQUESTED")
                        .size()
        );

        report.put(
                "approvedRefunds",
                refundRepository
                        .findByStatus("APPROVED")
                        .size()
        );

        report.put(
                "completedRefunds",
                refundRepository
                        .findByStatus("COMPLETED")
                        .size()
        );

        report.put(
                "rejectedRefunds",
                refundRepository
                        .findByStatus("REJECTED")
                        .size()
        );

        return report;
    }
}