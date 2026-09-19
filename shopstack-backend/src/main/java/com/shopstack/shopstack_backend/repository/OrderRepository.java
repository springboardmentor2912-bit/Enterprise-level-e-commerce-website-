package com.shopstack.shopstack_backend.repository;

import com.shopstack.shopstack_backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByOrderDateDesc(Long customerId);

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    double getTotalRevenue();

    List<Order> findAllByOrderByOrderDateDesc();

    @Query("""
    SELECT COUNT(DISTINCT oi.order.id)
    FROM OrderItem oi
        WHERE oi.vendorId = :vendorId
    """)
    long countOrdersByVendorId(@Param("vendorId") Long vendorId);


    @Query("""
        SELECT COALESCE(SUM(oi.price * oi.quantity), 0)
        FROM OrderItem oi
        WHERE oi.vendorId = :vendorId
    """)
    double getSalesByVendorId(@Param("vendorId") Long vendorId);

    
}