package com.javaenterprise.order.repository;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.user.entity.User;
import com.javaenterprise.warehouse.entity.Warehouse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.shippingAddress WHERE o.id = :id AND o.user = :user")
    Optional<Order> findByIdAndUser(@Param("id") Long id, @Param("user") User user);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.shippingAddress WHERE o.user = :user ORDER BY o.orderDate DESC")
    List<Order> findByUser(@Param("user") User user);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.shippingAddress ORDER BY o.orderDate DESC")
    List<Order> findAllByOrderByOrderDateDesc();

    // 🆕 NEW: Find orders that contain at least one product sold by this vendor
    // Traces: Order -> OrderItem -> Product -> Vendor
    @Query("""
           SELECT DISTINCT o FROM Order o
           LEFT JOIN FETCH o.items i
           LEFT JOIN FETCH i.product p
           WHERE p.vendor = :vendor
           ORDER BY o.orderDate DESC
           """)
    List<Order> findRecentOrdersForVendor(@Param("vendor") User vendor, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    long countByStatus(OrderStatus status);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.status NOT IN ('CANCELLED', 'REJECTED')
    """)
    BigDecimal totalRevenue();

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items i WHERE i.warehouse = :warehouse")
    List<Order> findByWarehouse(@Param("warehouse") Warehouse warehouse);
}