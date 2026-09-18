package com.infosys.springboard.authentication.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.springboard.authentication.repository.OrderRepository;
import com.infosys.springboard.authentication.repository.ProductRepository;
import com.infosys.springboard.authentication.repository.UserRepository;

@RestController
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {


private final UserRepository userRepository;
private final ProductRepository productRepository;
private final OrderRepository orderRepository;

public AdminDashboardController(
        UserRepository userRepository,
        ProductRepository productRepository,
        OrderRepository orderRepository) {

    this.userRepository = userRepository;
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
}

// =========================================================
// GET DASHBOARD STATISTICS
// GET /admin/dashboard/stats
// =========================================================

@GetMapping("/stats")
public ResponseEntity<Map<String, Long>> getDashboardStats() {

    long totalUsers =
            userRepository.count();

    long totalVendors =
            userRepository.countByRole("VENDOR");

    long totalProducts =
            productRepository.count();

    long totalOrders =
            orderRepository.count();

    Map<String, Long> statistics =
            new HashMap<>();

    statistics.put(
            "totalUsers",
            totalUsers
    );

    statistics.put(
            "totalVendors",
            totalVendors
    );

    statistics.put(
            "totalProducts",
            totalProducts
    );

    statistics.put(
            "totalOrders",
            totalOrders
    );

    return ResponseEntity.ok(statistics);
}


}
