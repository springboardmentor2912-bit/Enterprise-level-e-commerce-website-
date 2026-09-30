package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(String orderId);
    List<OrderItem> findByVendorId(Long vendorId);
    List<OrderItem> findByVendorIdOrderByIdDesc(Long vendorId);
}
