package com.shopstack.shopstack_backend.service;

import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.shopstack.shopstack_backend.dto.AdminAnalyticsResponse;
import com.shopstack.shopstack_backend.dto.AdminDashboardResponse;
import com.shopstack.shopstack_backend.dto.AdminVendorDetailsResponse;
import com.shopstack.shopstack_backend.dto.CommissionDTO;
import com.shopstack.shopstack_backend.dto.SystemMonitoringDTO;
import com.shopstack.shopstack_backend.dto.VendorResponse;

import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Product;
import com.shopstack.shopstack_backend.entity.ProductAvailability;
import com.shopstack.shopstack_backend.entity.ProductStatus;
import com.shopstack.shopstack_backend.entity.Role;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.entity.VendorStatus;

import com.shopstack.shopstack_backend.repository.OrderRepository;
import com.shopstack.shopstack_backend.repository.ProductRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;


@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AdminService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }


    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    public AdminDashboardResponse getDashboardData() {

        long totalCustomers =
                userRepository.countByRole(Role.CUSTOMER);

        long totalVendors =
                userRepository.countByRole(Role.VENDOR);

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        double totalRevenue =
                orderRepository.getTotalRevenue();

        long pendingOrders =
                orderRepository.countByStatus("PENDING");

        return new AdminDashboardResponse(
                totalCustomers,
                totalVendors,
                totalProducts,
                totalOrders,
                totalRevenue,
                pendingOrders
        );
    }


    // =========================================================
    // GET ALL VENDORS
    // =========================================================

    public List<VendorResponse> getVendors() {

        return userRepository
                .findByRole(Role.VENDOR)
                .stream()
                .map(VendorResponse::new)
                .toList();
    }


    // =========================================================
    // GET ALL ORDERS
    // =========================================================

    public List<Order> getAllOrders() {

        return orderRepository
                .findAllByOrderByOrderDateDesc();
    }


    // =========================================================
    // GET VENDOR
    // =========================================================

    public User getVendor(Long id) {

        return userRepository.findById(id)
                .filter(user ->
                        user.getRole() == Role.VENDOR
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendor not found"
                        )
                );
    }


    // =========================================================
    // GET VENDOR DETAILS
    // =========================================================

    public AdminVendorDetailsResponse getVendorDetails(
            Long vendorId
    ) {

        User vendor =
                userRepository.findById(vendorId)
                        .filter(user ->
                                user.getRole() == Role.VENDOR
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        long totalProducts =
                productRepository.countByVendorId(vendorId);


        long activeProducts =
                productRepository
                        .countByVendorIdAndAvailability(
                                vendorId,
                                ProductAvailability.ACTIVE
                        );


        long totalOrders =
                orderRepository
                        .countOrdersByVendorId(vendorId);


        double totalSales =
                orderRepository
                        .getSalesByVendorId(vendorId);


        return new AdminVendorDetailsResponse(
                vendor.getId(),
                vendor.getName(),
                vendor.getEmail(),
                vendor.getRole().name(),
                vendor.getVendorStatus(),
                totalProducts,
                activeProducts,
                totalOrders,
                totalSales
        );
    }


    // =========================================================
    // UPDATE VENDOR STATUS
    // =========================================================

    public AdminVendorDetailsResponse updateVendorStatus(
            Long vendorId,
            VendorStatus status
    ) {

        User vendor =
                userRepository.findById(vendorId)
                        .filter(user ->
                                user.getRole() == Role.VENDOR
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor not found"
                                )
                        );


        vendor.setVendorStatus(status);

        userRepository.save(vendor);

        return getVendorDetails(vendorId);
    }


    // =========================================================
    // GET VENDOR PRODUCTS FOR ADMIN
    // =========================================================

    public List<Product> getProductsByVendorForAdmin(
            Long vendorId
    ) {

        return productRepository
                .findByVendorId(vendorId);
    }


    // =========================================================
    // UPDATE PRODUCT STATUS
    // ACCEPT / REJECT PRODUCT
    // =========================================================

    public Product updateProductStatus(
            Long productId,
            ProductStatus status
    ) {

        Product product =
                productRepository.findById(productId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );


        product.setStatus(status);

        return productRepository.save(product);
    }


    // =========================================================
    // ANALYTICS
    // =========================================================

    public AdminAnalyticsResponse getAnalytics() {

        long totalVendors =
                userRepository.countByRole(Role.VENDOR);

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        double totalSales =
                orderRepository.getTotalRevenue();

        long pendingOrders =
                orderRepository.countByStatus("PENDING");

        long confirmedOrders =
                orderRepository.countByStatus("CONFIRMED");

        long deliveredOrders =
                orderRepository.countByStatus("DELIVERED");

        long cancelledOrders =
                orderRepository.countByStatus("CANCELLED");


        return new AdminAnalyticsResponse(
                totalVendors,
                totalProducts,
                totalOrders,
                totalSales,
                pendingOrders,
                confirmedOrders,
                deliveredOrders,
                cancelledOrders
        );
    }


    // =========================================================
    // COMMISSION DETAILS
    // =========================================================

    public List<CommissionDTO> getCommissionDetails() {

        List<User> vendors =
                userRepository.findByRole(Role.VENDOR);

        List<CommissionDTO> result =
                new ArrayList<>();


        double commissionRate = 10.0;


        for (User vendor : vendors) {

            double sales =
                    orderRepository.getSalesByVendorId(
                            vendor.getId()
                    );


            double commission =
                    sales * commissionRate / 100;


            double vendorEarnings =
                    sales - commission;


            CommissionDTO dto =
                    new CommissionDTO(
                            vendor.getId(),
                            vendor.getName(),
                            vendor.getEmail(),
                            sales,
                            commissionRate,
                            commission,
                            vendorEarnings
                    );


            result.add(dto);
        }


        return result;
    }


    // =========================================================
    // SYSTEM MONITORING
    // =========================================================

    public SystemMonitoringDTO getSystemMonitoring() {

        Runtime runtime =
                Runtime.getRuntime();


        long memoryUsed =
                runtime.totalMemory()
                        - runtime.freeMemory();


        long memoryMax =
                runtime.maxMemory();


        String databaseStatus = "UP";


        try {

            userRepository.count();

        } catch (Exception e) {

            databaseStatus = "DOWN";
        }


        return new SystemMonitoringDTO(
                "ShopStack Backend",
                "UP",
                databaseStatus,
                "Development",
                ManagementFactory
                        .getRuntimeMXBean()
                        .getUptime() / 1000,
                memoryUsed,
                memoryMax,
                LocalDateTime.now().toString()
        );
    }
}