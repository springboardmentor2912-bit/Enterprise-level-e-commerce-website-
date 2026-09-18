package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Order;
import com.shopstack.shopstack_backend.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(
            String customerEmail
    );

    // =========================
    // WAREHOUSE ORDERS
    // =========================

    List<Order> findByWarehouse(
            Warehouse warehouse
    );
}