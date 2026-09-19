package com.shopstack.backend.service;

import com.shopstack.backend.dto.AdminAnalyticsResponse;
import com.shopstack.backend.dto.AdminCommissionResponse;
import com.shopstack.backend.dto.AdminDashboardResponse;
import com.shopstack.backend.dto.AdminOrderResponse;
import com.shopstack.backend.dto.AdminVendorResponse;
import com.shopstack.backend.dto.VendorResponse;

import com.shopstack.backend.entity.Commission;
import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.OrderStatus;
import com.shopstack.backend.entity.User;

import com.shopstack.backend.enums.Role;

import com.shopstack.backend.repository.CommissionRepository;
import com.shopstack.backend.repository.OrderRepository;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CommissionRepository commissionRepository;


    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    public AdminDashboardResponse getDashboardData() {

        long totalUsers =
                userRepository.count();

        long totalVendors =
                userRepository.countByRole(Role.VENDOR);

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        double totalSales =
                orderRepository.findAll()
                        .stream()
                        .mapToDouble(order ->
                                order.getTotalAmount() != null
                                        ? order.getTotalAmount()
                                        : 0.0
                        )
                        .sum();

        return new AdminDashboardResponse(
                totalUsers,
                totalVendors,
                totalProducts,
                totalOrders,
                totalSales
        );
    }


    // =========================================================
    // CONVERT USER → VENDOR RESPONSE
    // =========================================================

    private VendorResponse convertToVendorResponse(User user) {

        return new VendorResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getCity(),
                user.getState(),
                user.getPincode(),
                user.getRole()
        );
    }


    // =========================================================
    // GET ALL VENDORS
    // =========================================================

    public List<AdminVendorResponse> getAllVendors() {

        List<User> vendors =
                userRepository.findByRole(Role.VENDOR);

        List<AdminVendorResponse> responses =
                new ArrayList<>();

        for (User vendor : vendors) {

            long productCount =
                    productRepository
                            .findByVendor(vendor)
                            .size();

            AdminVendorResponse response =
                    new AdminVendorResponse(
                            vendor.getId(),
                            vendor.getName(),
                            vendor.getEmail(),
                            vendor.getPhone(),
                            vendor.getAddress(),
                            vendor.getCity(),
                            vendor.getState(),
                            vendor.getPincode(),
                            productCount
                    );

            responses.add(response);
        }

        return responses;
    }


    // =========================================================
    // ADMIN ANALYTICS
    // =========================================================

    public AdminAnalyticsResponse getAnalyticsData() {

        long totalUsers =
                userRepository.count();

        long totalVendors =
                userRepository.countByRole(Role.VENDOR);

        long totalCustomers =
                userRepository.countByRole(Role.CUSTOMER);

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        List<Order> orders =
                orderRepository.findAll();


        // -----------------------------------------------------
        // TOTAL SALES
        // -----------------------------------------------------

        double totalSales =
                orders.stream()
                        .mapToDouble(order ->
                                order.getTotalAmount() != null
                                        ? order.getTotalAmount()
                                        : 0.0
                        )
                        .sum();


        // -----------------------------------------------------
        // ORDER STATUS COUNTS
        // -----------------------------------------------------

        long placedOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.PLACED)
                        .count();


        long confirmedOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.CONFIRMED)
                        .count();


        long processingOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.PROCESSING)
                        .count();


        long shippedOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.SHIPPED)
                        .count();


        long outForDeliveryOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.OUT_FOR_DELIVERY)
                        .count();


        long deliveredOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.DELIVERED)
                        .count();


        long cancelledOrders =
                orders.stream()
                        .filter(order ->
                                order.getStatus() == OrderStatus.CANCELLED)
                        .count();


        return new AdminAnalyticsResponse(
                totalUsers,
                totalVendors,
                totalCustomers,
                totalProducts,
                totalOrders,
                totalSales,
                placedOrders,
                confirmedOrders,
                processingOrders,
                shippedOrders,
                outForDeliveryOrders,
                deliveredOrders,
                cancelledOrders
        );
    }


    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    public List<AdminOrderResponse> getAllOrders() {

        List<Order> orders =
                orderRepository.findAllByOrderByOrderDateDesc();

        return orders.stream()
                .map(order -> new AdminOrderResponse(

                        order.getId(),

                        order.getUser() != null
                                ? order.getUser().getName()
                                : "Unknown",

                        order.getUser() != null
                                ? order.getUser().getEmail()
                                : "Unknown",

                        order.getTotalAmount(),

                        order.getStatus() != null
                                ? order.getStatus().name()
                                : "UNKNOWN",

                        order.getOrderDate()
                ))
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET ALL COMMISSIONS
    // =========================================================

    public List<AdminCommissionResponse> getAllCommissions() {

        List<Commission> commissions =
                commissionRepository.findAllByOrderByCreatedAtDesc();

        List<AdminCommissionResponse> responses =
                new ArrayList<>();


        for (Commission commission : commissions) {

            if (commission == null) {
                continue;
            }


            String vendorName = "Unknown";

            Long vendorId = null;

            if (commission.getVendor() != null) {

                vendorId =
                        commission.getVendor().getId();

                vendorName =
                        commission.getVendor().getName();
            }


            Long orderId = null;

            if (commission.getOrder() != null) {

                orderId =
                        commission.getOrder().getId();
            }


            String status = "UNKNOWN";

            if (commission.getStatus() != null) {

                status =
                        commission.getStatus().name();
            }


            responses.add(
                    new AdminCommissionResponse(

                            commission.getId(),

                            orderId,

                            vendorId,

                            vendorName,

                            commission.getSaleAmount(),

                            commission.getCommissionRate(),

                            commission.getCommissionAmount(),

                            commission.getVendorAmount(),

                            status,

                            commission.getCreatedAt()
                    )
            );
        }

        return responses;
    }


    // =========================================================
    // MARK COMMISSION AS PAID
    // =========================================================

    public AdminCommissionResponse markCommissionAsPaid(
            Long commissionId) {

        Commission commission =
                commissionRepository
                        .findById(commissionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Commission not found with ID: "
                                                + commissionId
                                )
                        );


        // -----------------------------------------------------
        // PREVENT DUPLICATE PAYMENT
        // -----------------------------------------------------

        if (commission.getStatus() != null &&
                commission.getStatus().name().equals("PAID")) {

            throw new RuntimeException(
                    "Commission has already been paid"
            );
        }


        // -----------------------------------------------------
        // PREVENT PAYMENT OF CANCELLED COMMISSION
        // -----------------------------------------------------

        if (commission.getStatus() != null &&
                commission.getStatus().name().equals("CANCELLED")) {

            throw new RuntimeException(
                    "Cancelled commission cannot be paid"
            );
        }


        // -----------------------------------------------------
        // CHANGE STATUS
        // -----------------------------------------------------

        commission.setStatus(
                com.shopstack.backend.entity.CommissionStatus.PAID
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        Commission savedCommission =
                commissionRepository.save(commission);


        // -----------------------------------------------------
        // PREPARE RESPONSE
        // -----------------------------------------------------

        Long vendorId = null;

        String vendorName = "Unknown";

        if (savedCommission.getVendor() != null) {

            vendorId =
                    savedCommission.getVendor().getId();

            vendorName =
                    savedCommission.getVendor().getName();
        }


        Long orderId = null;

        if (savedCommission.getOrder() != null) {

            orderId =
                    savedCommission.getOrder().getId();
        }


        String status =
                savedCommission.getStatus() != null
                        ? savedCommission.getStatus().name()
                        : "UNKNOWN";


        return new AdminCommissionResponse(

                savedCommission.getId(),

                orderId,

                vendorId,

                vendorName,

                savedCommission.getSaleAmount(),

                savedCommission.getCommissionRate(),

                savedCommission.getCommissionAmount(),

                savedCommission.getVendorAmount(),

                status,

                savedCommission.getCreatedAt()
        );
    }
}