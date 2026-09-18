package com.shopstack.repository;

import com.shopstack.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<Order> findByOrderNumber(String orderNumber);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.vendor.id = :vendorId ORDER BY o.createdAt DESC")
    Page<Order> findByVendorId(Long vendorId, Pageable pageable);
}
